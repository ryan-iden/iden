import {
  type OrganizationCenterOrganization,
  OrganizationManagementPermission,
  OrganizationManagementRoleType,
  organizationManagementPermissions,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import type Queries from '#src/tenants/Queries.js';

import { OrganizationAutonomyLibrary } from './organization-autonomy.js';

const { jest } = import.meta;

const createLibrary = () => new OrganizationAutonomyLibrary({} as Queries);

type ManagementRoleAssignmentWriter = {
  insertManagementRoleAssignment: (
    pool: CommonQueryMethods,
    data: { organizationId: string; userId: string; roleId: string }
  ) => Promise<void>;
};

describe('OrganizationAutonomyLibrary access control', () => {
  it('rejects users without an organization membership without exposing the organization', async () => {
    const pool = {
      exists: jest.fn().mockResolvedValue(false),
      any: jest.fn(),
    } as unknown as CommonQueryMethods;

    await expect(
      createLibrary().getAccess('organization-id', 'user-id', pool)
    ).rejects.toMatchObject({ code: 'entity.not_found', status: 404 });
    expect(pool.any).not.toHaveBeenCalled();
  });

  it('combines permissions from assigned custom management roles', async () => {
    const pool = {
      exists: jest.fn().mockResolvedValue(true),
      any: jest.fn().mockResolvedValue([
        {
          type: OrganizationManagementRoleType.Custom,
          permissions: [
            OrganizationManagementPermission.ViewMembers,
            OrganizationManagementPermission.ViewActivity,
          ],
        },
        {
          type: OrganizationManagementRoleType.Custom,
          permissions: [
            OrganizationManagementPermission.ViewMembers,
            OrganizationManagementPermission.ManageInvitations,
          ],
        },
      ]),
    } as unknown as CommonQueryMethods;

    await expect(createLibrary().getAccess('organization-id', 'user-id', pool)).resolves.toEqual({
      isOwner: false,
      permissions: [
        OrganizationManagementPermission.ViewMembers,
        OrganizationManagementPermission.ViewActivity,
        OrganizationManagementPermission.ManageInvitations,
      ],
    });
  });

  it('grants the complete management permission set to Owners', async () => {
    const pool = {
      exists: jest.fn().mockResolvedValue(true),
      any: jest.fn().mockResolvedValue([
        {
          type: OrganizationManagementRoleType.Owner,
          permissions: [],
        },
      ]),
    } as unknown as CommonQueryMethods;

    await expect(createLibrary().getAccess('organization-id', 'user-id', pool)).resolves.toEqual({
      isOwner: true,
      permissions: [...organizationManagementPermissions],
    });
  });

  it('uses unqualified INSERT target columns for management role assignments', async () => {
    const query = jest.fn().mockResolvedValue(null);
    const pool = { query } as unknown as CommonQueryMethods;

    await (
      createLibrary() as unknown as ManagementRoleAssignmentWriter
    ).insertManagementRoleAssignment(pool, {
      organizationId: 'organization-id',
      userId: 'user-id',
      roleId: 'role-id',
    });

    const [{ sql: statement }] = query.mock.calls[0] as unknown as [{ sql: string }];
    expect(statement).toContain(
      'insert into "organization_management_role_user_relations" (\n        "organization_id",\n        "user_id",\n        "organization_management_role_id"'
    );
    expect(statement).not.toContain(
      '"organization_management_role_user_relations"."organization_id"'
    );
  });

  it('updates and removes an organization avatar without discarding other branding fields', async () => {
    const findById = jest.fn().mockResolvedValue({
      branding: {
        logoUrl: 'https://example.com/old.png',
        darkLogoUrl: 'https://example.com/dark.png',
      },
    });
    const updateById = jest.fn().mockResolvedValue(null);
    const library = new OrganizationAutonomyLibrary({
      organizations: { findById, updateById },
    } as unknown as Queries);
    const response: OrganizationCenterOrganization = {
      id: 'organization-id',
      name: 'Organization',
      description: null,
      color: {},
      branding: {},
      customCss: null,
      isMfaRequired: false,
      createdAt: 1,
      createdBy: 'user-id',
      isOwner: false,
      permissions: [OrganizationManagementPermission.ManageBranding],
    };
    jest.spyOn(library, 'assertModule').mockResolvedValue({} as never);
    jest.spyOn(library, 'assertPermission').mockResolvedValue({
      isOwner: false,
      permissions: [OrganizationManagementPermission.ManageBranding],
    });
    jest.spyOn(library, 'getOrganization').mockResolvedValue(response);

    await expect(
      library.updateOrganizationAvatar('organization-id', 'user-id', 'https://example.com/new.png')
    ).resolves.toBe(response);
    expect(updateById).toHaveBeenLastCalledWith('organization-id', {
      branding: {
        logoUrl: 'https://example.com/new.png',
        darkLogoUrl: 'https://example.com/dark.png',
      },
    });

    await library.updateOrganizationAvatar('organization-id', 'user-id');
    expect(updateById).toHaveBeenLastCalledWith('organization-id', {
      branding: { darkLogoUrl: 'https://example.com/dark.png' },
    });
  });
});
