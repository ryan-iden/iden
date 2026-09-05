import experiencePhrases from '@logto/phrases-experience';
import {
  type OrganizationManagementRole,
  OrganizationManagementRoleType,
  RoleType,
} from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';
import i18next from 'i18next';

import useSystemLabels from './use-system-labels';

jest.mock('@/consts/brand', () => ({ brandProfile: { productName: 'iden' } }));

const administrator: OrganizationManagementRole = {
  id: 'role',
  tenantId: 'default',
  organizationId: 'organization',
  type: OrganizationManagementRoleType.Custom,
  name: 'Administrator',
  description: 'Full organization administration without ownership-only actions.',
  permissions: [],
  createdAt: 0,
  updatedAt: 0,
};

describe('built-in role display labels', () => {
  beforeAll(() => {
    for (const locale of ['en', 'zh-CN'] as const) {
      i18next.addResourceBundle(locale, 'experience', experiencePhrases[locale].translation);
    }
  });
  beforeEach(async () => {
    await act(async () => {
      await i18next.changeLanguage('zh-CN');
    });
  });
  afterEach(async () => {
    await act(async () => {
      await i18next.changeLanguage('en');
    });
  });

  it('translates built-in names without changing custom role names or descriptions', () => {
    const { result } = renderHook(useSystemLabels);
    expect(result.current.getManagementRoleName(administrator)).toBe('管理员');
    expect(result.current.getManagementRoleDescription(administrator)).not.toBe(
      administrator.description
    );
    const custom = { ...administrator, description: 'My custom administrator' };
    expect(result.current.getManagementRoleName(custom)).toBe('Administrator');
    expect(result.current.getManagementRoleDescription(custom)).toBe(custom.description);
    expect(
      result.current.getManagementRoleName({
        ...administrator,
        type: OrganizationManagementRoleType.Owner,
      })
    ).toBe('所有者');
  });

  it('localizes the canonical management API role but preserves its customized names', () => {
    const { result } = renderHook(useSystemLabels);
    const role = {
      id: 'role',
      tenantId: 'default',
      isDefault: false,
      type: RoleType.MachineToMachine,
      name: 'Logto Management API access',
      description: 'This default role grants access to the Logto management API.',
    };
    expect(result.current.getRoleName(role)).toBe('iden 管理接口');
    expect(result.current.getRoleDescription(role)).not.toBe(role.description);
    expect(result.current.getRoleName({ ...role, name: 'My service' })).toBe('My service');
  });
});
