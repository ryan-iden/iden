import type { OrganizationCenterOrganization, UserAssets } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const uploadOrganizationAvatar = async (
  accessToken: string,
  organizationId: string,
  file: File,
  options?: { signal?: AbortSignal }
) => {
  const formData = new FormData();
  formData.append('file', file);

  return createAuthenticatedKy(accessToken)
    .post(`/api/account/organizations/${organizationId}/avatar`, {
      body: formData,
      signal: options?.signal,
    })
    .json<UserAssets>();
};

export const removeOrganizationAvatar = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .delete(`/api/account/organizations/${organizationId}/avatar`)
    .json<OrganizationCenterOrganization>();
