import type { IncomingHttpHeaders } from 'node:http';

const strippedRequestHeaders = new Set([
  'authorization',
  'proxy-authorization',
  'forwarded',
  'logto-id-token',
  'logto-host',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
]);

export const isProtectedPath = (pathname: string, pageRules: ReadonlyArray<{ path: string }>) =>
  pageRules.length === 0 ||
  pageRules.some(({ path }) => {
    try {
      return new RegExp(path).test(pathname);
    } catch {
      return false;
    }
  });

type ProxyHeaderOptions = {
  incomingHeaders: IncomingHttpHeaders;
  upstreamHost: string;
  protectedHost: string;
  remoteAddress?: string;
  appId: string;
  appSecret: string;
  idToken?: string;
};

export const buildProtectedAppProxyHeaders = ({
  incomingHeaders,
  upstreamHost,
  protectedHost,
  remoteAddress,
  appId,
  appSecret,
  idToken,
}: ProxyHeaderOptions) => ({
  ...Object.fromEntries(
    Object.entries(incomingHeaders).filter(([name]) => !strippedRequestHeaders.has(name))
  ),
  host: upstreamHost,
  authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
  'logto-host': protectedHost,
  'x-forwarded-host': protectedHost,
  'x-forwarded-proto': 'https',
  'x-forwarded-for': remoteAddress ?? '',
  ...(idToken && { 'logto-id-token': idToken }),
});
