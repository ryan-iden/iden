import { adminTenantId } from '@logto/schemas';

/** The admin tenant is an internal control-plane tenant and must never appear as a user tenant. */
export const filterSelfHostedUserTenants = <Tenant extends { readonly id: string }>(
  tenants: readonly Tenant[]
) => tenants.filter(({ id }) => id !== adminTenantId);
