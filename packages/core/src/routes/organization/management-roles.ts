import {
  type CreateOrganization,
  type Organization,
  type OrganizationKeys,
  OrganizationManagementRoles,
  organizationManagementPermissionsGuard,
} from '@logto/schemas';
import { z } from 'zod';

import type { OrganizationAutonomyLibrary } from '#src/libraries/organization-autonomy.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';

import type { ManagementApiRouterContext } from '../types.js';

const getManagementContext = <Context>(context: Context) =>
  // eslint-disable-next-line no-restricted-syntax -- Management auth and audit middleware augment the generic schema router context at runtime.
  context as Context & ManagementApiRouterContext;

export default function organizationManagementRoleRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizationAutonomy: OrganizationAutonomyLibrary
) {
  router.get(
    '/:id/management-roles',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: OrganizationManagementRoles.guard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      ctx.body = await organizationAutonomy.listManagementRolesAsTenantAdmin(ctx.guard.params.id);
      return next();
    }
  );

  router.post(
    '/:id/management-roles/bootstrap-owner',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ userId: z.string().min(1) }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { userId } = ctx.guard.body;
      const log = getManagementContext(ctx).createLog('Organization.Owner.Assign');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'user', id: userId },
      });
      await organizationAutonomy.bootstrapOwner(id, userId);
      ctx.status = 204;
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId: id,
        updatedUserIds: [userId],
      });
      return next();
    }
  );

  router.post(
    '/:id/management-roles',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: OrganizationManagementRoles.createGuard.pick({
        name: true,
        description: true,
        permissions: true,
      }),
      response: OrganizationManagementRoles.guard,
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const role = await organizationAutonomy.createManagementRoleAsTenantAdmin(id, ctx.guard.body);
      const log = getManagementContext(ctx).createLog('Organization.ManagementRole.Create');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'organizationManagementRole', id: role.id },
      });
      ctx.body = role;
      ctx.status = 201;
      ctx.appendDataHookContext('OrganizationManagementRole.Created', {
        organizationId: id,
        managementRole: role,
      });
      return next();
    }
  );

  router.patch(
    '/:id/management-roles/:roleId',
    koaGuard({
      params: z.object({ id: z.string().min(1), roleId: z.string().min(1) }),
      body: z.object({
        name: z.string().min(1).max(128).optional(),
        description: z.string().max(256).nullable().optional(),
        permissions: organizationManagementPermissionsGuard.optional(),
      }),
      response: OrganizationManagementRoles.guard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id, roleId } = ctx.guard.params;
      const role = await organizationAutonomy.updateManagementRoleAsTenantAdmin(
        id,
        roleId,
        ctx.guard.body
      );
      const log = getManagementContext(ctx).createLog('Organization.ManagementRole.Update');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'organizationManagementRole', id: roleId },
        changes: Object.fromEntries(Object.keys(ctx.guard.body).map((key) => [key, true])),
      });
      ctx.body = role;
      ctx.appendDataHookContext('OrganizationManagementRole.Data.Updated', {
        organizationId: id,
        managementRole: role,
      });
      return next();
    }
  );

  router.delete(
    '/:id/management-roles/:roleId',
    koaGuard({
      params: z.object({ id: z.string().min(1), roleId: z.string().min(1) }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id, roleId } = ctx.guard.params;
      const log = getManagementContext(ctx).createLog('Organization.ManagementRole.Delete');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'organizationManagementRole', id: roleId },
      });
      await organizationAutonomy.deleteManagementRoleAsTenantAdmin(id, roleId);
      ctx.status = 204;
      ctx.appendDataHookContext('OrganizationManagementRole.Deleted', {
        organizationId: id,
        managementRole: { id: roleId },
      });
      return next();
    }
  );

  router.post(
    '/:id/management-roles/:roleId/users/:userId',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
        roleId: z.string().min(1),
        userId: z.string().min(1),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id, roleId, userId } = ctx.guard.params;
      const log = getManagementContext(ctx).createLog('Organization.ManagementRole.Assign');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'user', id: userId, roleId },
      });
      await organizationAutonomy.assignManagementRoleAsTenantAdmin(id, roleId, userId);
      ctx.status = 204;
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId: id,
        updatedUserIds: [userId],
        managementRoleIds: [roleId],
      });
      return next();
    }
  );

  router.delete(
    '/:id/management-roles/:roleId/users/:userId',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
        roleId: z.string().min(1),
        userId: z.string().min(1),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id, roleId, userId } = ctx.guard.params;
      const log = getManagementContext(ctx).createLog('Organization.ManagementRole.Unassign');
      log.append({
        actorId: getManagementContext(ctx).auth.id,
        organizationId: id,
        source: 'ManagementApi',
        target: { type: 'user', id: userId, roleId },
      });
      await organizationAutonomy.unassignManagementRoleAsTenantAdmin(id, roleId, userId);
      ctx.status = 204;
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        organizationId: id,
        updatedUserIds: [userId],
        managementRoleIds: [roleId],
      });
      return next();
    }
  );
}
