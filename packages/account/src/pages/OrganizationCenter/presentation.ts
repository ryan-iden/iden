import {
  OrganizationManagementRoleType,
  type OrganizationCenterMember,
  type OrganizationLogKey,
} from '@logto/schemas';
import { type TFunction } from 'i18next';

export const getMemberDisplayName = (
  member: Pick<OrganizationCenterMember, 'id' | 'username' | 'name' | 'primaryEmail'>
) =>
  [member.username, member.name, member.primaryEmail].find((value) => value?.trim()) ?? member.id;

type ManagementRoleSummary = OrganizationCenterMember['organizationManagementRoles'][number];

// Only translate system-owned labels. Custom role names and descriptions remain user content.
const getBuiltInRole = (role: ManagementRoleSummary) => {
  if (role.type === OrganizationManagementRoleType.Owner) {
    return 'owner';
  }
  if (
    role.name === 'Administrator' &&
    role.description === 'Full organization administration without ownership-only actions.'
  ) {
    return 'administrator';
  }
};

export const getManagementRoleName = (role: ManagementRoleSummary, translate: TFunction) => {
  const builtInRole = getBuiltInRole(role);
  return builtInRole
    ? translate(`account_center.organizations.roles.built_in.${builtInRole}`)
    : role.name;
};

export const getManagementRoleDescription = (role: ManagementRoleSummary, translate: TFunction) => {
  const builtInRole = getBuiltInRole(role);
  return builtInRole
    ? translate(`account_center.organizations.roles.built_in.${builtInRole}_description`)
    : role.description?.trim().length
      ? role.description
      : undefined;
};

export const organizationActivityLabels = {
  'Organization.Create': 'create',
  'Organization.Delete': 'delete',
  'Organization.Profile.Update': 'profile',
  'Organization.Branding.Update': 'branding',
  'Organization.Security.Update': 'security',
  'Organization.Member.Add': 'member_add',
  'Organization.Member.Remove': 'member_remove',
  'Organization.Owner.Assign': 'owner',
  'Organization.Owner.Remove': 'owner',
  'Organization.ManagementRole.Create': 'role_create',
  'Organization.ManagementRole.Update': 'role_update',
  'Organization.ManagementRole.Delete': 'role_delete',
  'Organization.ManagementRole.Assign': 'role_assign',
  'Organization.ManagementRole.Unassign': 'role_unassign',
  'Organization.BusinessRole.Update': 'business_role',
  'Organization.Invitation.Create': 'invitation_create',
  'Organization.Invitation.Accept': 'invitation_accept',
  'Organization.Invitation.Decline': 'invitation_decline',
  'Organization.Invitation.Revoke': 'invitation_revoke',
  'Organization.Jit.Update': 'jit',
  'Organization.Domain.Verification': 'domain',
  'Organization.Application.Update': 'application',
} as const satisfies Record<OrganizationLogKey, string>;

export const getOrganizationActivityLabel = (key: string, translate: TFunction) => {
  const label = Object.entries(organizationActivityLabels).find(([event]) => event === key)?.[1];
  return label
    ? translate(`account_center.organizations.activity.events.${label}`)
    : translate('account_center.organizations.activity.events.unknown');
};
