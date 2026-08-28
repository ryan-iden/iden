import { ServiceConnector } from '@logto/connector-kit';

import { EnvSet } from '#src/env-set/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { ensureSelfHostedEmailConnector } from './ensure-self-hosted-email-connector.js';

const { jest } = import.meta;
const originalIsSelfHostedParityEnabled = EnvSet.values.isSelfHostedParityEnabled;

const setSelfHostedParityEnabled = (isSelfHostedParityEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests cover enabled and disabled states.
  (EnvSet.values as { isSelfHostedParityEnabled: boolean }).isSelfHostedParityEnabled =
    isSelfHostedParityEnabled;
};

describe('ensureSelfHostedEmailConnector', () => {
  afterEach(() => {
    jest.clearAllMocks();
    setSelfHostedParityEnabled(originalIsSelfHostedParityEnabled);
  });

  it('creates a globally unique connector for each tenant', async () => {
    setSelfHostedParityEnabled(true);
    const countConnectorByConnectorId = jest.fn().mockResolvedValue({ count: 0 });
    const insertConnector = jest.fn();
    const queries = new MockQueries({
      connectors: { countConnectorByConnectorId, insertConnector },
    });

    await ensureSelfHostedEmailConnector('admin', queries);

    expect(countConnectorByConnectorId).toHaveBeenCalledWith(ServiceConnector.Email);
    expect(insertConnector).toHaveBeenCalledWith({
      id: 'self-hosted-email-admin',
      connectorId: ServiceConnector.Email,
      config: {},
      metadata: {},
    });
  });

  it('keeps an existing tenant connector unchanged', async () => {
    setSelfHostedParityEnabled(true);
    const insertConnector = jest.fn();
    const queries = new MockQueries({
      connectors: {
        countConnectorByConnectorId: jest.fn().mockResolvedValue({ count: 1 }),
        insertConnector,
      },
    });

    await ensureSelfHostedEmailConnector('admin', queries);

    expect(insertConnector).not.toHaveBeenCalled();
  });

  it('does nothing when self-hosted parity is disabled', async () => {
    setSelfHostedParityEnabled(false);
    const countConnectorByConnectorId = jest.fn();
    const insertConnector = jest.fn();
    const queries = new MockQueries({
      connectors: { countConnectorByConnectorId, insertConnector },
    });

    await ensureSelfHostedEmailConnector('admin', queries);

    expect(countConnectorByConnectorId).not.toHaveBeenCalled();
    expect(insertConnector).not.toHaveBeenCalled();
  });
});
