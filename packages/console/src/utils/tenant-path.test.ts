import {
  getGlobalConsolePath,
  getTenantIdFromPathname,
  getTenantPath,
  getTenantRoutePath,
} from './tenant-path';

const reservedRoutes = ['/callback', '/accept', '/profile', '/welcome'];

describe('tenant path utilities', () => {
  const cloudOptions = { isSelfHostedTenantManagementEnabled: false } as const;
  const selfHostedOptions = { isSelfHostedTenantManagementEnabled: true } as const;

  it('preserves the self-hosted Console mount point for tenant routes', () => {
    expect(getTenantPath('default', '/applications', selfHostedOptions)).toBe(
      '/console/default/applications'
    );
    expect(getTenantRoutePath(selfHostedOptions)).toBe('/console/:tenantId');
    expect(getGlobalConsolePath('/callback', selfHostedOptions)).toBe('/console/callback');
  });

  it('keeps the existing Cloud route shape', () => {
    expect(getTenantPath('default', '/applications', cloudOptions)).toBe('/default/applications');
    expect(getTenantRoutePath(cloudOptions)).toBe('/:tenantId');
    expect(getGlobalConsolePath('/callback', cloudOptions)).toBe('/callback');
  });

  it('extracts a tenant ID after the self-hosted Console mount point', () => {
    expect(
      getTenantIdFromPathname('/console/default/get-started', {
        ...selfHostedOptions,
        isTenantManagementEnabled: true,
        reservedRoutes,
      })
    ).toBe('default');
  });

  it.each(['/console', '/console/callback', '/console/accept/invitation-id', '/console/welcome'])(
    'does not interpret the global self-hosted path %s as a tenant',
    (pathname) => {
      expect(
        getTenantIdFromPathname(pathname, {
          ...selfHostedOptions,
          isTenantManagementEnabled: true,
          reservedRoutes,
        })
      ).toBe('');
    }
  );
});
