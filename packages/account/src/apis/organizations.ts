import type {
  Log,
  OrganizationCenterMember,
  OrganizationCenterOrganization,
  OrganizationInvitationEntity,
  OrganizationManagementPermission,
  OrganizationManagementRole,
  OrganizationJitEmailDomain,
  OrganizationJitEmailDomainVerification,
} from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export type AvailableOrganizationResources = {
  ssoConnectors: Array<{ id: string; name: string; assigned: boolean }>;
  applications: Array<{ id: string; name: string; type: string; assigned: boolean }>;
  organizationRoles: Array<{
    id: string;
    name: string;
    description: string | undefined;
    assigned: boolean;
  }>;
};

export type JitEmailDomainState = {
  emailDomains: OrganizationJitEmailDomain[];
  verifications: OrganizationJitEmailDomainVerification[];
};

const withVerification = (verificationId?: string) =>
  verificationId ? { headers: { [verificationRecordIdHeader]: verificationId } } : undefined;

export const listOrganizations = async (accessToken: string) =>
  createAuthenticatedKy(accessToken)
    .get('/api/account/organizations')
    .json<OrganizationCenterOrganization[]>();

export const createOrganization = async (
  accessToken: string,
  payload: { name: string; description?: string }
) =>
  createAuthenticatedKy(accessToken)
    .post('/api/account/organizations', { json: payload })
    .json<OrganizationCenterOrganization>();

export const getOrganization = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}`)
    .json<OrganizationCenterOrganization>();

export const updateOrganization = async (
  accessToken: string,
  organizationId: string,
  payload: {
    name?: string;
    description?: string | undefined;
    color?: OrganizationCenterOrganization['color'];
    branding?: OrganizationCenterOrganization['branding'];
    customCss?: string | undefined;
    isMfaRequired?: boolean;
  },
  verificationId?: string
) =>
  createAuthenticatedKy(accessToken)
    .patch(`/api/account/organizations/${organizationId}`, {
      json: payload,
      ...withVerification(verificationId),
    })
    .json<OrganizationCenterOrganization>();

export const deleteOrganization = async (
  accessToken: string,
  organizationId: string,
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).delete(`/api/account/organizations/${organizationId}`, {
    ...withVerification(verificationId),
  });
};

export const listOrganizationMembers = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/members`)
    .json<OrganizationCenterMember[]>();

export const removeOrganizationMember = async (
  accessToken: string,
  organizationId: string,
  userId: string,
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/account/organizations/${organizationId}/members/${userId}`,
    { ...withVerification(verificationId) }
  );
};

export const listOrganizationInvitations = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/invitations`)
    .json<OrganizationInvitationEntity[]>();

export const createOrganizationInvitation = async (
  accessToken: string,
  organizationId: string,
  payload: {
    invitee: string;
    organizationRoleIds: string[];
    organizationManagementRoleIds: string[];
  },
  verificationId?: string
) =>
  createAuthenticatedKy(accessToken)
    .post(`/api/account/organizations/${organizationId}/invitations`, {
      json: payload,
      ...withVerification(verificationId),
    })
    .json<OrganizationInvitationEntity>();

export const resendOrganizationInvitation = async (
  accessToken: string,
  organizationId: string,
  invitationId: string
) =>
  createAuthenticatedKy(accessToken)
    .post(`/api/account/organizations/${organizationId}/invitations/${invitationId}/resend`)
    .json<OrganizationInvitationEntity>();

export const revokeOrganizationInvitation = async (
  accessToken: string,
  organizationId: string,
  invitationId: string
) => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/account/organizations/${organizationId}/invitations/${invitationId}`
  );
};

export const listPendingOrganizationInvitations = async (accessToken: string) =>
  createAuthenticatedKy(accessToken)
    .get('/api/account/organization-invitations')
    .json<OrganizationInvitationEntity[]>();

export const updateOwnOrganizationInvitation = async (
  accessToken: string,
  invitationId: string,
  action: 'accept' | 'decline'
) =>
  createAuthenticatedKy(accessToken)
    .post(`/api/account/organization-invitations/${invitationId}/${action}`)
    .json<OrganizationInvitationEntity>();

export const listOrganizationManagementRoles = async (
  accessToken: string,
  organizationId: string
) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/management-roles`)
    .json<OrganizationManagementRole[]>();

export const createOrganizationManagementRole = async (
  accessToken: string,
  organizationId: string,
  payload: {
    name: string;
    description?: string | undefined;
    permissions: OrganizationManagementPermission[];
  },
  verificationId?: string
) =>
  createAuthenticatedKy(accessToken)
    .post(`/api/account/organizations/${organizationId}/management-roles`, {
      json: payload,
      ...withVerification(verificationId),
    })
    .json<OrganizationManagementRole>();

export const assignOrganizationManagementRole = async (
  accessToken: string,
  {
    organizationId,
    roleId,
    userId,
    verificationId,
  }: {
    organizationId: string;
    roleId: string;
    userId: string;
    verificationId?: string;
  }
) => {
  await createAuthenticatedKy(accessToken).post(
    `/api/account/organizations/${organizationId}/management-roles/${roleId}/users/${userId}`,
    { ...withVerification(verificationId) }
  );
};

export const unassignOrganizationManagementRole = async (
  accessToken: string,
  {
    organizationId,
    roleId,
    userId,
    verificationId,
  }: {
    organizationId: string;
    roleId: string;
    userId: string;
    verificationId?: string;
  }
) => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/account/organizations/${organizationId}/management-roles/${roleId}/users/${userId}`,
    { ...withVerification(verificationId) }
  );
};

export const replaceOrganizationSsoConnectors = async (
  accessToken: string,
  organizationId: string,
  ssoConnectorIds: string[],
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).put(
    `/api/account/organizations/${organizationId}/jit/sso-connectors`,
    { json: { ssoConnectorIds }, ...withVerification(verificationId) }
  );
};

export const replaceOrganizationApplications = async (
  accessToken: string,
  organizationId: string,
  applicationIds: string[],
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).put(
    `/api/account/organizations/${organizationId}/applications`,
    { json: { applicationIds }, ...withVerification(verificationId) }
  );
};

export const replaceJitOrganizationRoles = async (
  accessToken: string,
  organizationId: string,
  organizationRoleIds: string[],
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).put(
    `/api/account/organizations/${organizationId}/jit/business-roles`,
    { json: { organizationRoleIds }, ...withVerification(verificationId) }
  );
};

export const replaceMemberOrganizationRoles = async (
  accessToken: string,
  {
    organizationId,
    userId,
    organizationRoleIds,
    verificationId,
  }: {
    organizationId: string;
    userId: string;
    organizationRoleIds: string[];
    verificationId?: string;
  }
) => {
  await createAuthenticatedKy(accessToken).put(
    `/api/account/organizations/${organizationId}/members/${userId}/business-roles`,
    { json: { organizationRoleIds }, ...withVerification(verificationId) }
  );
};

export const listOrganizationActivity = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/activity`)
    .json<Log[]>();

export const getAvailableOrganizationResources = async (
  accessToken: string,
  organizationId: string
) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/available-resources`)
    .json<AvailableOrganizationResources>();

export const getJitEmailDomains = async (accessToken: string, organizationId: string) =>
  createAuthenticatedKy(accessToken)
    .get(`/api/account/organizations/${organizationId}/jit/email-domains`)
    .json<JitEmailDomainState>();

export const createJitEmailDomainVerification = async (
  accessToken: string,
  organizationId: string,
  domain: string,
  verificationId?: string
) =>
  createAuthenticatedKy(accessToken)
    .post(`/api/account/organizations/${organizationId}/jit/email-domain-verifications`, {
      json: { domain },
      ...withVerification(verificationId),
    })
    .json<JitEmailDomainState['verifications'][number]>();

export const verifyJitEmailDomain = async (
  accessToken: string,
  organizationId: string,
  domainVerificationId: string,
  verificationId?: string
) =>
  createAuthenticatedKy(accessToken)
    .post(
      `/api/account/organizations/${organizationId}/jit/email-domain-verifications/${domainVerificationId}/verify`,
      { ...withVerification(verificationId) }
    )
    .json<JitEmailDomainState['verifications'][number]>();

export const deleteJitEmailDomain = async (
  accessToken: string,
  organizationId: string,
  domain: string,
  verificationId?: string
) => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/account/organizations/${organizationId}/jit/email-domains/${encodeURIComponent(domain)}`,
    { ...withVerification(verificationId) }
  );
};
