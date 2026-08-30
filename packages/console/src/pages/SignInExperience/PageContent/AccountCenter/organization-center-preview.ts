export const getOrganizationCenterPreviewUrl = (tenantEndpoint?: URL) =>
  tenantEndpoint && new URL('/account/organizations', tenantEndpoint).href;
