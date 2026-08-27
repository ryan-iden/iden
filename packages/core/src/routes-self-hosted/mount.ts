import { adminTenantId } from '@logto/schemas';
import type Koa from 'koa';
import mount from 'koa-mount';

import { EnvSet } from '#src/env-set/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import initSelfHostedControlApi from './init.js';
import initSelfHostedMapiProxy from './mapi-proxy.js';

export const mountSelfHostedParityApis = (app: Koa, tenant: TenantContext) => {
  if (tenant.id !== adminTenantId || !EnvSet.values.isSelfHostedParityEnabled) {
    return;
  }

  app.use(mount('/api', initSelfHostedControlApi(tenant)));
  app.use(mount('/m', initSelfHostedMapiProxy(tenant)));
};
