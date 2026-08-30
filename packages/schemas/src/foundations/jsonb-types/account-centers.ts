import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

export enum AccountCenterControlValue {
  Off = 'Off',
  ReadOnly = 'ReadOnly',
  Edit = 'Edit',
}

/**
 * Control list of each field in the account center (profile API)
 * all fields are optional, if not set, the default value is `Off`
 * this can make the alteration of the field control easier
 */
export const accountCenterFieldControlGuard = z
  .object({
    name: z.nativeEnum(AccountCenterControlValue),
    avatar: z.nativeEnum(AccountCenterControlValue),
    profile: z.nativeEnum(AccountCenterControlValue),
    email: z.nativeEnum(AccountCenterControlValue),
    phone: z.nativeEnum(AccountCenterControlValue),
    password: z.nativeEnum(AccountCenterControlValue),
    username: z.nativeEnum(AccountCenterControlValue),
    social: z.nativeEnum(AccountCenterControlValue),
    customData: z.nativeEnum(AccountCenterControlValue),
    mfa: z.nativeEnum(AccountCenterControlValue),
    passkey: z.nativeEnum(AccountCenterControlValue),
    session: z.nativeEnum(AccountCenterControlValue),
    trustedDevice: z.nativeEnum(AccountCenterControlValue),
  })
  .partial();

export type AccountCenterFieldControl = z.infer<typeof accountCenterFieldControlGuard>;

export const webauthnRelatedOriginsGuard = z.array(z.string());

export type WebauthnRelatedOrigins = z.infer<typeof webauthnRelatedOriginsGuard>;

/**
 * Configuration for which custom profile fields are exposed in the prebuilt account center and
 * in which order. Each entry references an existing field by name in the `custom_profile_fields`
 * catalog; fields in the catalog but not in this list are not shown in the account center.
 *
 * Kept separate from `signUpProfileFields` so the sign-up and account-center surfaces can be
 * configured independently against the same catalog.
 */
export type AccountCenterProfileFieldItem = {
  name: string;
};

export const accountCenterProfileFieldItemGuard = z.object({
  name: z.string(),
}) satisfies ToZodObject<AccountCenterProfileFieldItem>;

export const accountCenterProfileFieldsGuard = z.array(accountCenterProfileFieldItemGuard);

export type AccountCenterProfileFields = z.infer<typeof accountCenterProfileFieldsGuard>;

export enum OrganizationCenterCreationMode {
  Disabled = 'disabled',
  All = 'all',
  Roles = 'roles',
}

export enum OrganizationManagementPermission {
  UpdateProfile = 'update_profile',
  ManageBranding = 'manage_branding',
  ViewMembers = 'view_members',
  ManageMembers = 'manage_members',
  ManageInvitations = 'manage_invitations',
  AssignBusinessRoles = 'assign_business_roles',
  ManageManagementRoles = 'manage_management_roles',
  AssignManagementRoles = 'assign_management_roles',
  ManageSecurity = 'manage_security',
  ManageJit = 'manage_jit',
  ManageApplications = 'manage_applications',
  ViewActivity = 'view_activity',
}

export const organizationManagementPermissions = Object.freeze(
  Object.values(OrganizationManagementPermission)
);

export const organizationCenterModulesGuard = z.object({
  profile: z.boolean(),
  branding: z.boolean(),
  members: z.boolean(),
  invitations: z.boolean(),
  managementRoles: z.boolean(),
  businessRoles: z.boolean(),
  security: z.boolean(),
  jit: z.boolean(),
  applications: z.boolean(),
  activity: z.boolean(),
  deletion: z.boolean(),
});

export const organizationCenterSettingsGuard = z.object({
  enabled: z.boolean(),
  modules: organizationCenterModulesGuard,
  creationPolicy: z.object({
    mode: z.nativeEnum(OrganizationCenterCreationMode),
    allowedRoleIds: z.array(z.string().min(1).max(21)),
    maxOrganizationsPerUser: z.number().int().min(1).max(100),
  }),
  invitationPolicy: z.object({
    allowRegistration: z.boolean(),
    expiresInDays: z.number().int().min(1).max(30),
  }),
  resourceAllowlist: z.object({
    ssoConnectorIds: z.array(z.string().min(1).max(128)),
    applicationIds: z.array(z.string().min(1).max(21)),
    organizationRoleIds: z.array(z.string().min(1).max(21)),
  }),
});

/** Safe organization-center settings exposed to the prebuilt Account Center. */
export const publicOrganizationCenterSettingsGuard = organizationCenterSettingsGuard.pick({
  enabled: true,
  modules: true,
  creationPolicy: true,
  invitationPolicy: true,
});

export type OrganizationCenterSettings = z.infer<typeof organizationCenterSettingsGuard>;

export const defaultOrganizationCenterSettings = Object.freeze({
  enabled: false,
  modules: {
    profile: true,
    branding: true,
    members: true,
    invitations: true,
    managementRoles: true,
    businessRoles: true,
    security: true,
    jit: true,
    applications: true,
    activity: true,
    deletion: true,
  },
  creationPolicy: {
    mode: OrganizationCenterCreationMode.Disabled,
    allowedRoleIds: [],
    maxOrganizationsPerUser: 1,
  },
  invitationPolicy: {
    allowRegistration: true,
    expiresInDays: 7,
  },
  resourceAllowlist: {
    ssoConnectorIds: [],
    applicationIds: [],
    organizationRoleIds: [],
  },
} satisfies OrganizationCenterSettings);

export const organizationManagementPermissionsGuard = z.array(
  z.nativeEnum(OrganizationManagementPermission)
);

export type OrganizationManagementPermissions = z.infer<
  typeof organizationManagementPermissionsGuard
>;

export const deleteAccountUrlGuard = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value === '' ||
      ((value.startsWith('https://') || value.startsWith('http://')) &&
        z.string().url().safeParse(value).success),
    {
      message: 'deleteAccountUrl must be a valid http(s) URL',
    }
  );
