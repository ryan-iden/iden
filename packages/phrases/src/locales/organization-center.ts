const organizationCenter = Object.freeze({
  title: 'ORGANIZATION CENTER',
  description:
    'Configure the prebuilt organization experience for end users to create and autonomously manage organizations.',
  enabled: 'Enable organization center',
  enabled_description:
    'Expose organization management in the prebuilt account center and enable its user-facing APIs.',
  preview: 'Open organization center preview',
  modules: 'Available modules',
  creation_policy: 'Organization creation',
  creation_mode: 'Who can create organizations',
  creation_disabled: 'Nobody',
  creation_all: 'All signed-in users',
  creation_roles: 'Users with selected global roles',
  allowed_roles: 'Allowed global role IDs',
  allowed_roles_description: 'Comma-separated role IDs. Used only by the selected-roles policy.',
  creation_limit: 'Maximum organizations per user',
  invitation_policy: 'Invitations',
  invitation_registration: 'Allow invited users to register',
  invitation_expiry: 'Invitation validity (days)',
  resource_allowlist: 'Shared resource allowlist',
  sso_connectors: 'Enterprise SSO connector IDs',
  applications: 'Machine-to-machine application IDs',
  business_roles: 'Organization business role IDs',
  allowlist_description: 'Comma-separated IDs. An empty list shares no resources.',
  module_labels: {
    profile: 'Profile',
    branding: 'Branding',
    members: 'Members',
    invitations: 'Invitations',
    managementRoles: 'Management roles',
    businessRoles: 'Business roles',
    security: 'Security and MFA',
    jit: 'JIT provisioning',
    applications: 'M2M applications',
    activity: 'Activity',
    deletion: 'Organization deletion',
  },
});

export const withOrganizationCenter = <T extends { account_center: Record<string, unknown> }>(
  signInExperience: T
) => ({
  ...signInExperience,
  account_center: {
    ...signInExperience.account_center,
    organization_center: organizationCenter,
  },
});
