import { ServiceConnector } from '@logto/connector-kit';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

export const ensureSelfHostedEmailConnector = async (tenantId: string, queries: Queries) => {
  if (!EnvSet.values.isSelfHostedParityEnabled) {
    return;
  }

  const { countConnectorByConnectorId, insertConnector } = queries.connectors;
  const { count } = await countConnectorByConnectorId(ServiceConnector.Email);
  if (count > 0) {
    return;
  }

  await insertConnector({
    // Connector IDs are globally unique even though connector queries are tenant-scoped.
    id: `self-hosted-email-${tenantId}`,
    connectorId: ServiceConnector.Email,
    config: {},
    metadata: {},
  });
};
