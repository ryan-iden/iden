import DefaultUserAvatar from '@experience/shared/components/DefaultUserAvatar';
import { resolveDefaultAvatarSeed } from '@logto/core-kit';
import { type OrganizationCenterMember, OrganizationManagementRoleType } from '@logto/schemas';
import { Save, Trash2 } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';
import { getManagementRoleName, getMemberDisplayName } from './presentation';

type Props = {
  readonly member: OrganizationCenterMember;
  readonly isEditing: boolean;
  readonly hasBusinessRolePermission: boolean;
  readonly hasRemoveMemberPermission: boolean;
  readonly hasUnassignRolePermission: boolean;
  readonly isOwner: boolean;
  readonly availableRoles: ReadonlyArray<{ id: string; name: string }>;
  readonly selectedRoleIds: readonly string[];
  readonly onToggleEditor: () => void;
  readonly onCancel: () => void;
  readonly onChangeRoles: (roleIds: string[]) => void;
  readonly onSave: () => Promise<void>;
  readonly onRemove: () => Promise<void>;
  readonly onUnassignRole: (roleId: string) => Promise<void>;
};

const MemberListItem = ({
  member,
  isEditing,
  hasBusinessRolePermission,
  hasRemoveMemberPermission,
  hasUnassignRolePermission,
  isOwner,
  availableRoles,
  selectedRoleIds,
  onToggleEditor,
  onCancel,
  onChangeRoles,
  onSave,
  onRemove,
  onUnassignRole,
}: Props) => {
  const { t } = useTranslation();
  const editorId = useId();
  const displayName = getMemberDisplayName(member);

  return (
    <div className={styles.memberItem}>
      <div className={styles.memberSummary}>
        {member.avatar ? (
          <img
            className={styles.memberAvatar}
            src={member.avatar}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <DefaultUserAvatar
            className={styles.memberAvatar}
            seed={resolveDefaultAvatarSeed(member.id, member.primaryEmail, member.name)}
          />
        )}
        <div className={styles.rowMain}>
          <strong title={displayName}>{displayName}</strong>
          {member.primaryEmail !== displayName && <span>{member.primaryEmail}</span>}
          <div className={styles.chips}>
            {member.isOwner &&
              !member.organizationManagementRoles.some(
                ({ type }) => type === OrganizationManagementRoleType.Owner
              ) && <span>{t('account_center.organizations.owner')}</span>}
            {member.organizationManagementRoles.map((role) => (
              <span key={role.id}>
                {getManagementRoleName(role, t)}
                {hasUnassignRolePermission &&
                  (role.type !== OrganizationManagementRoleType.Owner || isOwner) && (
                    <button
                      type="button"
                      className={styles.chipButton}
                      aria-label={t('account_center.organizations.roles.unassign')}
                      onClick={async () => onUnassignRole(role.id)}
                    >
                      ×
                    </button>
                  )}
              </span>
            ))}
            {member.organizationRoles.map(({ id, name }) => (
              <span key={id}>{name}</span>
            ))}
          </div>
        </div>
        <div className={styles.memberActions}>
          {hasBusinessRolePermission && (
            <button
              type="button"
              className={styles.secondaryButton}
              aria-expanded={isEditing}
              aria-controls={isEditing ? editorId : undefined}
              onClick={onToggleEditor}
            >
              {t('account_center.organizations.members.business_roles')}
            </button>
          )}
          {hasRemoveMemberPermission && (
            <button type="button" className={styles.secondaryButton} onClick={onRemove}>
              <Trash2 size={15} /> {t('account_center.organizations.members.remove')}
            </button>
          )}
        </div>
      </div>
      {isEditing && (
        <div id={editorId} className={styles.memberRoleEditor}>
          <fieldset className={styles.permissionGrid}>
            <legend>{t('account_center.organizations.members.business_roles')}</legend>
            {availableRoles.map((role) => (
              <label key={role.id}>
                <input
                  type="checkbox"
                  className={styles.businessRoleCheckbox}
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={(event) => {
                    onChangeRoles(
                      event.target.checked
                        ? [...selectedRoleIds, role.id]
                        : selectedRoleIds.filter((id) => id !== role.id)
                    );
                  }}
                />
                {role.name}
              </label>
            ))}
            {availableRoles.length === 0 && (
              <p className={styles.roleEditorHint}>
                {t('account_center.organizations.members.no_business_roles')}
              </p>
            )}
          </fieldset>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={onCancel}>
              {t('account_center.organizations.cancel')}
            </button>
            <button type="button" className={styles.primaryButton} onClick={onSave}>
              <Save size={15} /> {t('account_center.organizations.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberListItem;
