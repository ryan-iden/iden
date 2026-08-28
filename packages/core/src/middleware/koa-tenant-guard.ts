import type { Middleware } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import createTenantQueries from '#src/queries/tenant.js';
import type Queries from '#src/tenants/Queries.js';

export default function koaTenantGuard<StateT, ContextT extends IRouterParamContext, BodyT>(
  tenantId: string,
  { tenants }: Queries
): Middleware<StateT, ContextT, BodyT> {
  return async (ctx, next) => {
    const { isCloud, isSelfHostedParityEnabled } = EnvSet.values;

    if (!isCloud && !isSelfHostedParityEnabled) {
      return next();
    }

    const tenantQueries =
      !isCloud && isSelfHostedParityEnabled
        ? createTenantQueries(await EnvSet.sharedPool)
        : tenants;
    const { isSuspended, deletedAt } = await tenantQueries.findTenantMetadataById(tenantId);

    if (isSuspended || deletedAt) {
      throw new RequestError('subscription.tenant_suspended', 403);
    }

    await next();
  };
}
