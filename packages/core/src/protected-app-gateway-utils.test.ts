import { buildProtectedAppProxyHeaders, isProtectedPath } from './protected-app-gateway-utils.js';

describe('protected app gateway utilities', () => {
  it('protects every path by default and only matching paths when rules exist', () => {
    expect(isProtectedPath('/public', [])).toBe(true);
    expect(isProtectedPath('/private/profile', [{ path: '^/private' }])).toBe(true);
    expect(isProtectedPath('/public', [{ path: '^/private' }])).toBe(false);
    expect(isProtectedPath('/public', [{ path: '[' }])).toBe(false);
  });

  it('removes forged identity and forwarding headers before injecting trusted values', () => {
    const headers = buildProtectedAppProxyHeaders({
      incomingHeaders: {
        authorization: 'Bearer forged',
        'logto-id-token': 'forged-token',
        'x-forwarded-for': '203.0.113.10',
        'x-forwarded-proto': 'http',
        'x-client-header': 'preserved',
      },
      upstreamHost: 'origin.internal',
      protectedHost: 'app.example.com',
      remoteAddress: '192.0.2.10',
      appId: 'app-id',
      appSecret: 'app-secret',
      idToken: 'trusted-token',
    });

    expect(headers).toMatchObject({
      host: 'origin.internal',
      authorization: `Basic ${Buffer.from('app-id:app-secret').toString('base64')}`,
      'logto-id-token': 'trusted-token',
      'logto-host': 'app.example.com',
      'x-forwarded-for': '192.0.2.10',
      'x-forwarded-proto': 'https',
      'x-client-header': 'preserved',
    });
  });
});
