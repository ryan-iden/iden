import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import http, { type IncomingHttpHeaders, type ServerResponse } from 'node:http';
import https from 'node:https';

import { formUrlEncodedHeaders } from '@logto/shared';
import { got } from 'got';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

import { buildProtectedAppProxyHeaders, isProtectedPath } from './protected-app-gateway-utils.js';

const callbackPath = '/sign-in-callback';
const sessionCookieName = '__Host-logto_pa_session';
const stateCookieName = '__Host-logto_pa_state';
const configCacheTtl = 30_000;

const gatewayConfigGuard = z.object({
  host: z.string(),
  origin: z.string().url(),
  sessionDuration: z.number().positive(),
  pageRules: z.array(z.object({ path: z.string() })),
  additionalScopes: z.string().array().optional(),
  sdkConfig: z.object({
    appId: z.string(),
    appSecret: z.string(),
    endpoint: z.string().url(),
  }),
});

type GatewayConfig = z.infer<typeof gatewayConfigGuard>;
type AuthorizationState = {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  expiresAt: number;
};
type GatewaySession = { idToken: string; expiresAt: number };
const authorizationStateGuard = z.object({
  state: z.string(),
  nonce: z.string(),
  verifier: z.string(),
  returnTo: z.string(),
  expiresAt: z.number(),
});
const gatewaySessionGuard = z.object({ idToken: z.string(), expiresAt: z.number() });

const discoveryGuard = z.object({
  issuer: z.string(),
  authorization_endpoint: z.string(),
  token_endpoint: z.string(),
  jwks_uri: z.string(),
});
const tokenResponseGuard = z.object({ id_token: z.string() });
const configCache = new Map<string, { value: GatewayConfig; expiresAt: number }>();

const requiredEnvironment = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
};

const coreEndpoint = requiredEnvironment('PROTECTED_APP_GATEWAY_CORE_ENDPOINT');
const sharedSecret = requiredEnvironment('PROTECTED_APP_GATEWAY_SHARED_SECRET');
const sessionSecret = requiredEnvironment('PROTECTED_APP_GATEWAY_SESSION_SECRET');
const encryptionKey = createHash('sha256').update(sessionSecret).digest();

const seal = (value: Record<string, unknown>) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
};

const unseal = (value: string | undefined): unknown => {
  if (!value) {
    return;
  }
  try {
    const data = Buffer.from(value, 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const parsed: unknown = JSON.parse(
      Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')
    );
    return parsed;
  } catch {}
};

const parseCookies = (header: string | undefined) =>
  Object.fromEntries(
    (header ?? '').split(';').flatMap((entry) => {
      const index = entry.indexOf('=');
      return index < 0
        ? []
        : [[entry.slice(0, index).trim(), decodeURIComponent(entry.slice(index + 1).trim())]];
    })
  );

const setCookie = (response: ServerResponse, name: string, value: string, maxAge: number) => {
  const cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
  const current = response.getHeader('set-cookie');
  response.setHeader('set-cookie', [
    ...(Array.isArray(current) ? current.map(String) : current ? [String(current)] : []),
    cookie,
  ]);
};

const getHost = (headers: IncomingHttpHeaders) => {
  const forwardedHost = headers['x-forwarded-host'];
  const value = Array.isArray(forwardedHost) ? forwardedHost[0] : (forwardedHost ?? headers.host);
  return value?.split(',')[0]?.trim().split(':')[0];
};

const getGatewayConfig = async (host: string) => {
  const cached = configCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const url = new URL('/api/internal/protected-app/config', coreEndpoint);
  url.searchParams.set('host', host);
  const value = gatewayConfigGuard.parse(
    await got.get(url, { headers: { 'x-logto-protected-app-key': sharedSecret } }).json()
  );
  configCache.set(host, { value, expiresAt: Date.now() + configCacheTtl });
  return value;
};

const getDiscovery = async (endpoint: string) =>
  discoveryGuard.parse(
    await got.get(new URL('/.well-known/openid-configuration', endpoint)).json()
  );

const codeChallenge = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url');

const redirectToSignIn = async (
  requestUrl: URL,
  config: GatewayConfig,
  response: ServerResponse
) => {
  const discovery = await getDiscovery(config.sdkConfig.endpoint);
  const state: AuthorizationState = {
    state: randomBytes(24).toString('base64url'),
    nonce: randomBytes(24).toString('base64url'),
    verifier: randomBytes(48).toString('base64url'),
    returnTo: `${requestUrl.pathname}${requestUrl.search}`,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  setCookie(response, stateCookieName, seal(state), 10 * 60);
  const authorizationSearch = new URLSearchParams({
    client_id: config.sdkConfig.appId,
    redirect_uri: `https://${config.host}${callbackPath}`,
    response_type: 'code',
    scope: ['openid', 'profile', 'email', ...(config.additionalScopes ?? [])].join(' '),
    state: state.state,
    nonce: state.nonce,
    code_challenge: codeChallenge(state.verifier),
    code_challenge_method: 'S256',
  });
  const authorizationUrl = new URL(
    `?${authorizationSearch.toString()}`,
    discovery.authorization_endpoint
  );
  response.writeHead(302, { location: authorizationUrl.href }).end();
};

const handleCallback = async (
  requestUrl: URL,
  config: GatewayConfig,
  cookies: Record<string, string>,
  response: ServerResponse
) => {
  const state = authorizationStateGuard.safeParse(unseal(cookies[stateCookieName])).data;
  const code = requestUrl.searchParams.get('code');
  const returnedState = requestUrl.searchParams.get('state');
  if (!state || state.expiresAt <= Date.now() || returnedState !== state.state || !code) {
    response.writeHead(400).end('Invalid or expired authorization response.');
    return;
  }

  const discovery = await getDiscovery(config.sdkConfig.endpoint);
  const redirectUri = `https://${config.host}${callbackPath}`;
  const tokenResponse = tokenResponseGuard.parse(
    await got
      .post(discovery.token_endpoint, {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: `Basic ${Buffer.from(
            `${config.sdkConfig.appId}:${config.sdkConfig.appSecret}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: state.verifier,
        }),
      })
      .json()
  );
  const { payload } = await jwtVerify(
    tokenResponse.id_token,
    createRemoteJWKSet(new URL(discovery.jwks_uri)),
    { issuer: discovery.issuer, audience: config.sdkConfig.appId }
  );
  if (payload.nonce !== state.nonce || !payload.exp) {
    response.writeHead(400).end('Invalid ID token.');
    return;
  }

  const sessionExpiresAt = Math.min(payload.exp * 1000, Date.now() + config.sessionDuration * 1000);
  setCookie(
    response,
    sessionCookieName,
    seal({ idToken: tokenResponse.id_token, expiresAt: sessionExpiresAt } satisfies GatewaySession),
    (sessionExpiresAt - Date.now()) / 1000
  );
  setCookie(response, stateCookieName, '', 0);
  response.writeHead(302, { location: state.returnTo }).end();
};

const proxyRequest = (
  request: http.IncomingMessage,
  response: ServerResponse,
  config: GatewayConfig,
  idToken?: string
) => {
  const incomingUrl = new URL(request.url ?? '/', 'http://gateway.local');
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, config.origin);
  const headers = buildProtectedAppProxyHeaders({
    incomingHeaders: request.headers,
    upstreamHost: upstreamUrl.host,
    protectedHost: config.host,
    remoteAddress: request.socket.remoteAddress,
    appId: config.sdkConfig.appId,
    appSecret: config.sdkConfig.appSecret,
    idToken,
  });

  const transport = upstreamUrl.protocol === 'https:' ? https : http;
  const upstreamRequest = transport.request(
    upstreamUrl,
    { method: request.method, headers },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    }
  );
  upstreamRequest.on('error', () => {
    if (response.headersSent) {
      response.destroy();
    } else {
      response.writeHead(502).end('Protected application origin is unavailable.');
    }
  });
  request.pipe(upstreamRequest);
};

const server = http.createServer(async (request, response) => {
  try {
    const host = getHost(request.headers);
    if (!host) {
      response.writeHead(400).end('Missing Host header.');
      return;
    }

    const config = await getGatewayConfig(host);
    const requestUrl = new URL(request.url ?? '/', `https://${host}`);
    const cookies = parseCookies(request.headers.cookie);
    if (requestUrl.pathname === callbackPath) {
      await handleCallback(requestUrl, config, cookies, response);
      return;
    }

    if (!isProtectedPath(requestUrl.pathname, config.pageRules)) {
      proxyRequest(request, response, config);
      return;
    }

    const session = gatewaySessionGuard.safeParse(unseal(cookies[sessionCookieName])).data;
    if (!session || session.expiresAt <= Date.now()) {
      await redirectToSignIn(requestUrl, config, response);
      return;
    }

    proxyRequest(request, response, config, session.idToken);
  } catch {
    if (response.headersSent) {
      response.destroy();
    } else {
      response.writeHead(503).end('Protected application configuration is unavailable.');
    }
  }
});

const port = Number(process.env.PROTECTED_APP_GATEWAY_PORT ?? 3004);
server.listen(port, '0.0.0.0');

const shutdown = () => {
  server.close();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
