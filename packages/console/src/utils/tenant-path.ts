import { ossConsolePath } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';
import { matchPath } from 'react-router-dom';

type TenantPathOptions = {
  isSelfHostedTenantManagementEnabled: boolean;
};

/** Builds a tenant-aware Console path while preserving the self-hosted `/console` mount point. */
export const getTenantPath = (
  tenantId: string,
  pathname: string,
  { isSelfHostedTenantManagementEnabled }: TenantPathOptions
) => joinPath(isSelfHostedTenantManagementEnabled ? ossConsolePath : '/', tenantId, pathname);

/** Builds a global Console path such as the OIDC callback or invitation landing route. */
export const getGlobalConsolePath = (
  pathname: string,
  { isSelfHostedTenantManagementEnabled }: TenantPathOptions
) => joinPath(isSelfHostedTenantManagementEnabled ? ossConsolePath : '/', pathname);

export const getTenantRoutePath = ({ isSelfHostedTenantManagementEnabled }: TenantPathOptions) =>
  getTenantPath(':tenantId', '', { isSelfHostedTenantManagementEnabled });

type GetTenantIdFromPathnameOptions = TenantPathOptions & {
  isTenantManagementEnabled: boolean;
  reservedRoutes: readonly string[];
};

/** Returns the tenant ID encoded in a Console URL, excluding global Console routes. */
export const getTenantIdFromPathname = (
  pathname: string,
  {
    isSelfHostedTenantManagementEnabled,
    isTenantManagementEnabled,
    reservedRoutes,
  }: GetTenantIdFromPathnameOptions
) => {
  if (!isTenantManagementEnabled) {
    return '';
  }

  const relativePathname = isSelfHostedTenantManagementEnabled
    ? pathname === ossConsolePath
      ? '/'
      : pathname.startsWith(ossConsolePath + '/')
        ? pathname.slice(ossConsolePath.length)
        : undefined
    : pathname;

  if (
    !relativePathname ||
    reservedRoutes.some(
      (route) => relativePathname === route || relativePathname.startsWith(route + '/')
    )
  ) {
    return '';
  }

  return matchPath('/:tenantId/*', relativePathname)?.params.tenantId ?? '';
};
