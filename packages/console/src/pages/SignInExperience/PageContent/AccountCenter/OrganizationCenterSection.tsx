import { OrganizationCenterCreationMode, type OrganizationCenterSettings } from '@logto/schemas';
import { useCallback, useContext, type FormEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { isSelfHostedParityEnabled } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';

import type { AccountCenterFormValues, SignInExperienceForm } from '../../types';

import styles from './index.module.scss';
import { getOrganizationCenterPreviewUrl } from './organization-center-preview';

type OrganizationModule = keyof OrganizationCenterSettings['modules'];
type ResourceAllowlist = keyof OrganizationCenterSettings['resourceAllowlist'];

const moduleKeys: readonly OrganizationModule[] = [
  'profile',
  'branding',
  'members',
  'invitations',
  'managementRoles',
  'businessRoles',
  'security',
  'jit',
  'applications',
  'activity',
  'deletion',
];

const parseIdList = (value: string) => [
  ...new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  ),
];

function OrganizationCenterSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenantEndpoint } = useContext(AppDataContext);
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<SignInExperienceForm & { accountCenter: AccountCenterFormValues }>();
  const settings = watch('accountCenter.organizationCenter');

  const updateIdList = useCallback(
    (field: ResourceAllowlist, event: FormEvent<HTMLInputElement>) => {
      setValue(
        `accountCenter.organizationCenter.resourceAllowlist.${field}`,
        parseIdList(event.currentTarget.value),
        { shouldDirty: true }
      );
    },
    [setValue]
  );

  if (!isSelfHostedParityEnabled) {
    return null;
  }

  return (
    <FormCard
      title="sign_in_exp.account_center.organization_center.title"
      description="sign_in_exp.account_center.organization_center.description"
    >
      <div className={styles.cardContent}>
        <FormField
          title="sign_in_exp.account_center.organization_center.enabled"
          description="sign_in_exp.account_center.organization_center.enabled_description"
          headlineSpacing="large"
        >
          <Switch
            checked={settings.enabled}
            disabled={isSubmitting}
            onChange={(event) => {
              setValue('accountCenter.organizationCenter.enabled', event.currentTarget.checked, {
                shouldDirty: true,
              });
            }}
          />
        </FormField>

        <FormField
          title="sign_in_exp.account_center.organization_center.modules"
          headlineSpacing="large"
        >
          <div className={styles.moduleGrid}>
            {moduleKeys.map((module) => (
              <label key={module} className={styles.moduleItem}>
                <span>
                  {t(`sign_in_exp.account_center.organization_center.module_labels.${module}`)}
                </span>
                <Switch
                  checked={settings.modules[module]}
                  disabled={!settings.enabled || isSubmitting}
                  onChange={(event) => {
                    setValue(
                      `accountCenter.organizationCenter.modules.${module}`,
                      event.currentTarget.checked,
                      { shouldDirty: true }
                    );
                  }}
                />
              </label>
            ))}
          </div>
        </FormField>

        <FormField
          title="sign_in_exp.account_center.organization_center.creation_policy"
          headlineSpacing="large"
        >
          <div className={styles.organizationFields}>
            <label className={styles.inputField}>
              <span>{t('sign_in_exp.account_center.organization_center.creation_mode')}</span>
              <Select
                value={settings.creationPolicy.mode}
                isReadOnly={!settings.enabled}
                options={[
                  {
                    value: OrganizationCenterCreationMode.Disabled,
                    title: t('sign_in_exp.account_center.organization_center.creation_disabled'),
                  },
                  {
                    value: OrganizationCenterCreationMode.All,
                    title: t('sign_in_exp.account_center.organization_center.creation_all'),
                  },
                  {
                    value: OrganizationCenterCreationMode.Roles,
                    title: t('sign_in_exp.account_center.organization_center.creation_roles'),
                  },
                ]}
                onChange={(value) => {
                  if (value) {
                    setValue('accountCenter.organizationCenter.creationPolicy.mode', value, {
                      shouldDirty: true,
                    });
                  }
                }}
              />
            </label>
            <label className={styles.inputField}>
              <span>{t('sign_in_exp.account_center.organization_center.creation_limit')}</span>
              <TextInput
                type="number"
                min={1}
                max={100}
                disabled={!settings.enabled}
                value={settings.creationPolicy.maxOrganizationsPerUser}
                onChange={(event) => {
                  setValue(
                    'accountCenter.organizationCenter.creationPolicy.maxOrganizationsPerUser',
                    Number(event.currentTarget.value),
                    { shouldDirty: true }
                  );
                }}
              />
            </label>
            {settings.creationPolicy.mode === OrganizationCenterCreationMode.Roles && (
              <label className={styles.inputField}>
                <span>{t('sign_in_exp.account_center.organization_center.allowed_roles')}</span>
                <TextInput
                  disabled={!settings.enabled}
                  value={settings.creationPolicy.allowedRoleIds.join(', ')}
                  description={t(
                    'sign_in_exp.account_center.organization_center.allowed_roles_description'
                  )}
                  onChange={(event) => {
                    setValue(
                      'accountCenter.organizationCenter.creationPolicy.allowedRoleIds',
                      parseIdList(event.currentTarget.value),
                      { shouldDirty: true }
                    );
                  }}
                />
              </label>
            )}
          </div>
        </FormField>

        <FormField
          title="sign_in_exp.account_center.organization_center.invitation_policy"
          headlineSpacing="large"
        >
          <div className={styles.organizationFields}>
            <label className={styles.moduleItem}>
              <span>
                {t('sign_in_exp.account_center.organization_center.invitation_registration')}
              </span>
              <Switch
                checked={settings.invitationPolicy.allowRegistration}
                disabled={!settings.enabled}
                onChange={(event) => {
                  setValue(
                    'accountCenter.organizationCenter.invitationPolicy.allowRegistration',
                    event.currentTarget.checked,
                    { shouldDirty: true }
                  );
                }}
              />
            </label>
            <label className={styles.inputField}>
              <span>{t('sign_in_exp.account_center.organization_center.invitation_expiry')}</span>
              <TextInput
                type="number"
                min={1}
                max={30}
                disabled={!settings.enabled}
                value={settings.invitationPolicy.expiresInDays}
                onChange={(event) => {
                  setValue(
                    'accountCenter.organizationCenter.invitationPolicy.expiresInDays',
                    Number(event.currentTarget.value),
                    { shouldDirty: true }
                  );
                }}
              />
            </label>
          </div>
        </FormField>

        <FormField
          title="sign_in_exp.account_center.organization_center.resource_allowlist"
          description="sign_in_exp.account_center.organization_center.allowlist_description"
          headlineSpacing="large"
        >
          <div className={styles.organizationFields}>
            {(
              [
                ['ssoConnectorIds', 'sso_connectors'],
                ['applicationIds', 'applications'],
                ['organizationRoleIds', 'business_roles'],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className={styles.inputField}>
                <span>{t(`sign_in_exp.account_center.organization_center.${label}`)}</span>
                <TextInput
                  disabled={!settings.enabled}
                  value={settings.resourceAllowlist[field].join(', ')}
                  onChange={(event) => {
                    updateIdList(field, event);
                  }}
                />
              </label>
            ))}
          </div>
        </FormField>

        <a
          className={styles.previewLink}
          href={getOrganizationCenterPreviewUrl(tenantEndpoint)}
          target="_blank"
          rel="noreferrer"
        >
          {t('sign_in_exp.account_center.organization_center.preview')}
        </a>
      </div>
    </FormCard>
  );
}

export default OrganizationCenterSection;
