import { z } from 'zod';

import {
  type OrganizationRole,
  OrganizationRoles,
  type Organization,
  Organizations,
  type OrganizationInvitation,
  OrganizationInvitations,
  type Application,
  OrganizationManagementRoles,
} from '../db-entries/index.js';
import { organizationManagementPermissionsGuard } from '../foundations/index.js';
import { type ToZodObject } from '../utils/zod.js';

import { applicationResponseGuard } from './application.js';
import { type UserInfo, type FeaturedUser, userInfoGuard } from './user.js';

/**
 * The simplified organization scope entity that is returned for some endpoints.
 */
export type OrganizationScopeEntity = {
  id: string;
  name: string;
};

/**
 * The simplified resource scope entity that is returned for some endpoints.
 */
export type ResourceScopeEntity = {
  id: string;
  name: string;
  resource: {
    id: string;
    name: string;
  };
};

export type OrganizationRoleWithScopes = OrganizationRole & {
  scopes: OrganizationScopeEntity[];
  resourceScopes: ResourceScopeEntity[];
};

export const organizationRoleWithScopesGuard: ToZodObject<OrganizationRoleWithScopes> =
  OrganizationRoles.guard.extend({
    scopes: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
    resourceScopes: z
      .object({
        id: z.string(),
        name: z.string(),
        resource: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
      .array(),
  });

/**
 * The simplified organization role entity that is returned in the `roles` field
 * of the organization.
 */
export type OrganizationRoleEntity = {
  id: string;
  name: string;
};

const organizationRoleEntityGuard: ToZodObject<OrganizationRoleEntity> = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * The organization entity with the `organizationRoles` field that contains the
 * roles of the current member of the organization.
 */
export type OrganizationWithRoles = Organization & {
  /** The roles of the current member of the organization. */
  organizationRoles: OrganizationRoleEntity[];
};

export const organizationWithOrganizationRolesGuard: ToZodObject<OrganizationWithRoles> =
  Organizations.guard.extend({
    organizationRoles: organizationRoleEntityGuard.array(),
  });

/**
 * The user entity with the `organizationRoles` field that contains the roles of
 * the user in the organization.
 */
export type UserWithOrganizationRoles = UserInfo & {
  /** The roles of the user in the organization. */
  organizationRoles: OrganizationRoleEntity[];
};

export const userWithOrganizationRolesGuard: ToZodObject<UserWithOrganizationRoles> =
  userInfoGuard.extend({
    organizationRoles: organizationRoleEntityGuard.array(),
  });

/**
 * The organization entity with optional `usersCount` and `featuredUsers` fields.
 * They are useful for displaying the organization list in the frontend.
 */
export type OrganizationWithFeatured = Organization & {
  usersCount?: number;
  featuredUsers?: FeaturedUser[];
};

/**
 * The application entity with the `organizationRoles` field that contains the roles
 * of the application in the organization.
 */
export type ApplicationWithOrganizationRoles = Application & {
  /** The roles of the application in the organization. */
  organizationRoles: OrganizationRoleEntity[];
};

export const applicationWithOrganizationRolesGuard = applicationResponseGuard.extend({
  organizationRoles: organizationRoleEntityGuard.array(),
});

export type ApplicationWithOrganizationRolesResponse = z.infer<
  typeof applicationWithOrganizationRolesGuard
>;

/**
 * The organization invitation with additional fields:
 *
 * - `organizationRoles`: The roles to be assigned to the user when accepting the invitation.
 */
export type OrganizationInvitationEntity = OrganizationInvitation & {
  organizationRoles: OrganizationRoleEntity[];
  organizationManagementRoles: OrganizationRoleEntity[];
};

export const organizationInvitationEntityGuard: ToZodObject<OrganizationInvitationEntity> =
  OrganizationInvitations.guard.extend({
    organizationRoles: organizationRoleEntityGuard.array(),
    organizationManagementRoles: organizationRoleEntityGuard.array(),
  });

/** Safe organization data and the current member's effective management access. */
export const organizationCenterOrganizationGuard = Organizations.guard
  .pick({
    id: true,
    name: true,
    description: true,
    color: true,
    branding: true,
    customCss: true,
    isMfaRequired: true,
    createdAt: true,
    createdBy: true,
  })
  .extend({
    isOwner: z.boolean(),
    permissions: organizationManagementPermissionsGuard,
  });

export type OrganizationCenterOrganization = z.infer<typeof organizationCenterOrganizationGuard>;

export const organizationManagementRoleResponseGuard = OrganizationManagementRoles.guard;

/** Member fields safe for organization-local administrators. */
export const organizationCenterMemberGuard = userInfoGuard
  .pick({ id: true, name: true, avatar: true, primaryEmail: true, createdAt: true })
  .extend({
    // Optional for clients consuming responses from older self-hosted instances.
    username: userInfoGuard.shape.username.optional(),
    organizationRoles: organizationRoleEntityGuard.array(),
    organizationManagementRoles: organizationRoleEntityGuard
      .extend({
        type: OrganizationManagementRoles.guard.shape.type.optional(),
        description: OrganizationManagementRoles.guard.shape.description.optional(),
      })
      .array(),
    isOwner: z.boolean(),
  });

export type OrganizationCenterMember = z.infer<typeof organizationCenterMemberGuard>;
