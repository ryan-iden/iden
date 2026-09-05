import {
  type OrganizationManagementPermission,
  OrganizationManagementRoleType,
  organizationManagementPermissions,
  type OrganizationManagementRole,
  type UserWithOrganizationRoles,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import UserPreview from '@/components/ItemPreview/UserPreview';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Select from '@/ds-components/Select';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useInterfaceTranslation from '@/hooks/use-interface-translation';
import useSystemLabels from '@/hooks/use-system-labels';
import { buildUrl } from '@/utils/url';

import type { OrganizationDetailsOutletContext } from '../types';

import styles from './index.module.scss';

function ManagementAccess() {
  const { t: tUi } = useInterfaceTranslation();
  const { t: tOrg } = useTranslation('experience', { keyPrefix: 'account_center.organizations' });
  const { getManagementRoleName, getManagementRoleDescription } = useSystemLabels();
  const { data: organization } = useOutletContext<OrganizationDetailsOutletContext>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const {
    data: roles,
    error: rolesError,
    mutate: mutateRoles,
  } = useSWR<OrganizationManagementRole[], RequestError>(
    `api/organizations/${organization.id}/management-roles`
  );
  const { data: memberResponse, error: membersError } = useSWR<
    [UserWithOrganizationRoles[], number],
    RequestError
  >(
    buildUrl(`api/organizations/${organization.id}/users`, {
      page: '1',
      page_size: '100',
    })
  );
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>();
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<OrganizationManagementPermission[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const [selectedRoleId, setSelectedRoleId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const members = useMemo(() => memberResponse?.[0] ?? [], [memberResponse]);
  const hasOwnerRole = roles?.some(({ type }) => type === OrganizationManagementRoleType.Owner);
  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        value: member.id,
        title:
          [member.username, member.name, member.primaryEmail].find((value) => value?.trim()) ??
          member.id,
      })),
    [members]
  );
  const roleOptions =
    roles?.map((role) => ({ value: role.id, title: getManagementRoleName(role) })) ?? [];

  const bootstrapOwner = async () => {
    if (!selectedOwnerId || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`api/organizations/${organization.id}/management-roles/bootstrap-owner`, {
        json: { userId: selectedOwnerId },
      });
      await mutateRoles();
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRole = async () => {
    if (!roleName.trim() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`api/organizations/${organization.id}/management-roles`, {
        json: { name: roleName.trim(), permissions: rolePermissions },
      });
      setRoleName('');
      setRolePermissions([]);
      await mutateRoles();
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignRole = async () => {
    if (!selectedMemberId || !selectedRoleId || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(
        `api/organizations/${organization.id}/management-roles/${selectedRoleId}/users/${selectedMemberId}`
      );
      setSelectedMemberId(undefined);
      setSelectedRoleId(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {!hasOwnerRole && members.length > 0 && (
        <section className={styles.bootstrap}>
          <div>
            <h3>{t('organization_details.roles')}</h3>
            <p>{t('organization_details.settings_description')}</p>
          </div>
          <Select
            value={selectedOwnerId}
            options={memberOptions}
            placeholder={t('organization_details.user')}
            onChange={setSelectedOwnerId}
          />
          <Button
            type="primary"
            title="general.confirm"
            isLoading={isSubmitting}
            disabled={!selectedOwnerId}
            onClick={bootstrapOwner}
          />
        </section>
      )}
      <section className={styles.roleComposer}>
        <div className={styles.createRole}>
          <input
            value={roleName}
            placeholder={t('general.name')}
            onChange={(event) => {
              setRoleName(event.target.value);
            }}
          />
          <Button
            type="primary"
            title="general.create"
            isLoading={isSubmitting}
            disabled={!roleName.trim()}
            onClick={createRole}
          />
        </div>
        <div className={styles.permissionGrid}>
          {organizationManagementPermissions.map((permission) => (
            <label key={permission}>
              <input
                type="checkbox"
                checked={rolePermissions.includes(permission)}
                onChange={(event) => {
                  setRolePermissions((previous) =>
                    event.target.checked
                      ? [...previous, permission]
                      : previous.filter((value) => value !== permission)
                  );
                }}
              />
              <span>{tOrg(`roles.permission_labels.${permission}`)}</span>
            </label>
          ))}
        </div>
      </section>
      {hasOwnerRole && members.length > 0 && roles && roles.length > 0 && (
        <section className={styles.assignment}>
          <Select
            value={selectedMemberId}
            options={memberOptions}
            placeholder={t('organization_details.user')}
            onChange={setSelectedMemberId}
          />
          <Select
            value={selectedRoleId}
            options={roleOptions}
            placeholder={t('organization_details.roles')}
            onChange={setSelectedRoleId}
          />
          <Button
            type="primary"
            title="roles.assign_roles"
            isLoading={isSubmitting}
            disabled={!selectedMemberId || !selectedRoleId}
            onClick={assignRole}
          />
        </section>
      )}
      <Table
        isRowHoverEffectDisabled
        rowIndexKey="id"
        placeholder={<EmptyDataPlaceholder />}
        isLoading={!roles && !rolesError}
        errorMessage={(rolesError ?? membersError)?.toString()}
        rowGroups={[{ key: 'roles', data: roles ?? [] }]}
        columns={[
          {
            dataIndex: 'name',
            title: t('general.name'),
            colSpan: 5,
            render: (role) => (
              <div className={styles.roleName}>
                <strong>{getManagementRoleName(role)}</strong>
                <span>{getManagementRoleDescription(role)}</span>
              </div>
            ),
          },
          {
            dataIndex: 'type',
            title: <DangerousRaw>{tUi('type')}</DangerousRaw>,
            colSpan: 3,
            render: ({ type }) => (
              <Tag variant="cell">
                {type === OrganizationManagementRoleType.Owner ? tOrg('owner') : tUi('custom')}
              </Tag>
            ),
          },
          {
            dataIndex: 'permissions',
            title: <DangerousRaw>{tUi('permissions')}</DangerousRaw>,
            colSpan: 7,
            render: ({ permissions }) => (
              <DangerousRaw>
                {permissions.length > 0
                  ? permissions
                      .map((permission) => tOrg(`roles.permission_labels.${permission}`))
                      .join(', ')
                  : '-'}
              </DangerousRaw>
            ),
          },
        ]}
      />
      {hasOwnerRole && members.length > 0 && (
        <div className={styles.members}>
          {members.map((member) => (
            <UserPreview key={member.id} user={member} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ManagementAccess;
