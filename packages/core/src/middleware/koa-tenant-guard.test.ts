import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaTenantGuard from './koa-tenant-guard.js';

const { jest } = import.meta;

const mockFindTenantStatusById = jest.fn();
const mockSharedPoolOne = jest.fn();

const queries = new MockQueries({
  tenants: {
    findTenantMetadataById: mockFindTenantStatusById,
  },
});

describe('koaTenantGuard middleware', () => {
  const next = jest.fn();
  const ctx = createContextWithRouteParameters();
  const tenantId = 'tenant_id';

  afterEach(() => {
    jest.clearAllMocks();
    Sinon.restore();
  });

  it('should return directly if not in cloud', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: false,
    });

    await expect(koaTenantGuard(tenantId, queries)(ctx, next)).resolves.not.toThrow();
    expect(mockFindTenantStatusById).not.toBeCalled();
  });

  it('should use the shared management pool for self-hosted tenant metadata', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: false,
      isSelfHostedParityEnabled: true,
    });
    Sinon.stub(EnvSet, 'sharedPool').value(Promise.resolve({ one: mockSharedPoolOne } as never));
    mockSharedPoolOne.mockResolvedValueOnce({ id: tenantId, isSuspended: false });

    await expect(koaTenantGuard(tenantId, queries)(ctx, next)).resolves.not.toThrow();

    expect(mockSharedPoolOne).toBeCalledTimes(1);
    expect(mockFindTenantStatusById).not.toBeCalled();
  });

  it('should reject if tenant is suspended', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: true,
    });

    mockFindTenantStatusById.mockResolvedValueOnce({ id: tenantId, isSuspended: true });

    await expect(koaTenantGuard(tenantId, queries)(ctx, next)).rejects.toMatchError(
      new RequestError('subscription.tenant_suspended', 403)
    );
  });

  it('should resolve if tenant is not suspended', async () => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: true,
    });

    mockFindTenantStatusById.mockResolvedValueOnce({ tenantId, isSuspended: false });
    await expect(koaTenantGuard(tenantId, queries)(ctx, next)).resolves.not.toThrow();
  });
});
