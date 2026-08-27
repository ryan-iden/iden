import { ServiceConnector } from '@logto/connector-kit';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

export const ensureSelfHostedEmailConnector = async (queries: Queries) => {
  if (!EnvSet.values.isSelfHostedParityEnabled) {
    return;
  }

  const { countConnectorByConnectorId, insertConnector } = queries.connectors;
  const { count } = await countConnectorByConnectorId(ServiceConnector.Email);
  if (count > 0) {
    return;
  }

  await insertConnector({
    id: 'self-hosted-email',
    connectorId: ServiceConnector.Email,
    config: {},
    metadata: {},
  });
};
