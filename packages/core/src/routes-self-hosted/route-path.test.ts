import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { selfHostedTenantOrganizationPath } from './route-path.js';

describe('self-hosted tenant organization route', () => {
  it('makes the tenant ID available to prefix authentication middleware', async () => {
    const app = new Koa();
    const router = new Router();

    router.use(selfHostedTenantOrganizationPath, async (ctx, next) => {
      ctx.set('x-authenticated-tenant-id', String(ctx.params.tenantId));
      return next();
    });
    router.get(`${selfHostedTenantOrganizationPath}/members/:userId/scopes`, (ctx) => {
      ctx.status = 204;
    });
    app.use(router.routes());

    const response = await request(app.callback()).get('/tenants/default/members/user-id/scopes');

    expect(response.status).toBe(204);
    expect(response.headers['x-authenticated-tenant-id']).toBe('default');
  });
});
