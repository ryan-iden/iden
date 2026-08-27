import type TenantContext from './TenantContext.js';

type AcquiredTenant = TenantContext & { requestEnd: () => void };
type TenantAccessor = (tenantId: string) => Promise<AcquiredTenant>;
type TenantInvalidator = (tenantId: string) => void;

// eslint-disable-next-line @silverhand/fp/no-let -- The tenant pool registers itself once after construction to break route-module cycles.
let accessor: TenantAccessor | undefined;
// eslint-disable-next-line @silverhand/fp/no-let -- The tenant pool registers itself once after construction to break route-module cycles.
let invalidator: TenantInvalidator | undefined;

export const registerTenantPoolAccess = (
  nextAccessor: TenantAccessor,
  nextInvalidator: TenantInvalidator
) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- One-time process wiring avoids importing the pool from route modules.
  accessor = nextAccessor;
  // eslint-disable-next-line @silverhand/fp/no-mutation -- One-time process wiring avoids importing the pool from route modules.
  invalidator = nextInvalidator;
};

export const acquireTenant = async (tenantId: string) => {
  if (!accessor) {
    throw new Error('Tenant pool is not initialized.');
  }
  return accessor(tenantId);
};

export const invalidateTenant = (tenantId: string) => {
  invalidator?.(tenantId);
};
