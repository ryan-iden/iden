import {
  OrganizationManagementRoleType,
  RoleType,
  type OrganizationManagementRole,
  type Role,
} from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import { brandProfile } from '@/consts/brand';

import useInterfaceTranslation from './use-interface-translation';

const builtInRole = (role: Pick<OrganizationManagementRole, 'name' | 'type' | 'description'>) => {
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
const isManagementApiRole = (role: Pick<Role, 'name' | 'type' | 'description'>) =>
  role.type === RoleType.MachineToMachine &&
  role.name === 'Logto Management API access' &&
  role.description === 'This default role grants access to the Logto management API.';

/** Translate only canonical built-in data; never rewrite user-authored labels. */
export default function useSystemLabels() {
  const { t } = useTranslation('experience', {
    keyPrefix: 'account_center.organizations.roles.built_in',
  });
  const { t: tUi } = useInterfaceTranslation();

  return {
    managementApiName: tUi('management_api', { product: brandProfile.productName }),
    getManagementRoleName: (role: OrganizationManagementRole) => {
      const key = builtInRole(role);
      return key ? t(key) : role.name;
    },
    getManagementRoleDescription: (role: OrganizationManagementRole) => {
      const key = builtInRole(role);
      return key ? t(`${key}_description`) : role.description;
    },
    getRoleName: (role: Role) =>
      isManagementApiRole(role)
        ? tUi('management_api', { product: brandProfile.productName })
        : role.name,
    getRoleDescription: (role: Role) =>
      isManagementApiRole(role) ? tUi('management_api_role_description') : role.description,
  };
}
