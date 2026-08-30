import {
  OrganizationManagementPermission,
  OrganizationManagementRoleType,
  organizationManagementPermissions,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import type Queries from '#src/tenants/Queries.js';

import { OrganizationAutonomyLibrary } from './organization-autonomy.js';

const { jest } = import.meta;

const createLibrary = () => new OrganizationAutonomyLibrary({} as Queries);

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
});
