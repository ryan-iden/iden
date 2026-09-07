import { createServer } from 'node:http';

import { pickDefault } from '@logto/shared/esm';
import Koa, { type Context } from 'koa';
import request from 'supertest';

const { jest } = import.meta;

const getTenantId = jest.fn();
const resolveSelfHostedServiceTenantId = jest.fn();
const tenantPoolGet = jest.fn();
const trackException = jest.fn();

class TenantNotFoundError extends Error {}

jest.unstable_mockModule('@logto/app-insights/node', () => ({
  appInsights: {
    trackException,
  },
}));

jest.unstable_mockModule('#src/tenants/index.js', () => ({
  TenantNotFoundError,
  tenantPool: {
    get: tenantPoolGet,
  },
}));

jest.unstable_mockModule('#src/utils/tenant.js', () => ({
  getTenantId,
}));

jest.unstable_mockModule('#src/utils/self-hosted-service.js', () => ({
  resolveSelfHostedServiceTenantId,
}));

const initI18n = await pickDefault(import('../i18n/init.js'));
const initApp = await pickDefault(import('./init.js'));

describe('App Init', () => {
  const listenMock = jest
    .spyOn(Koa.prototype, 'listen')
    .mockImplementation(jest.fn(() => createServer()));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    await initApp(app);

    expect(listenMock).toBeCalled();
  });

  it('logs tenant initialization errors to the request console', async () => {
    const tenantError = new Error('tenant init failed');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    getTenantId.mockResolvedValueOnce(['default', false]);
    tenantPoolGet.mockRejectedValueOnce(tenantError);

    try {
      const app = new Koa();
      await initApp(app);

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(500);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0]).toContain(tenantError);
      expect(trackException).toHaveBeenCalledWith(tenantError, expect.any(Object));
    } finally {
      consoleError.mockRestore();
    }
  });

  it('routes an authenticated internal request to its explicit tenant', async () => {
    const requestEnd = jest.fn();
    const run = jest.fn(async (ctx: Context) => {
      ctx.status = 204;
    });
    resolveSelfHostedServiceTenantId.mockReturnValueOnce('tenant-a');
    tenantPoolGet.mockResolvedValueOnce({ run, requestEnd });

    const app = new Koa();
    await initApp(app);

    const response = await request(app.callback())
      .get('/api/configs/cimd')
      .set('x-logto-internal-token', 'shared-secret')
      .set('x-logto-tenant-id', 'tenant-a');

    expect(response.status).toBe(204);
    expect(tenantPoolGet).toHaveBeenCalledWith('tenant-a', undefined);
    expect(getTenantId).not.toHaveBeenCalled();
    expect(run).toHaveBeenCalledTimes(1);
    expect(requestEnd).toHaveBeenCalledTimes(1);
  });
});
