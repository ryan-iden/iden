import { AliyunCaptchaRegion, RecaptchaEnterpriseMode } from '@logto/schemas';
import { type UseFormRegister, type FieldErrors, Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';

import { type CaptchaProviderMetadata } from '../CreateCaptchaForm/types';
import { type CaptchaFormType } from '../types';

import styles from './index.module.scss';

type Props = {
  readonly metadata: CaptchaProviderMetadata;
  readonly errors: FieldErrors<CaptchaFormType>;
  readonly register: UseFormRegister<CaptchaFormType>;
  readonly control: Control<CaptchaFormType>;
};

function CaptchaFormFields({ metadata, errors, register, control }: Props) {
  const siteKeyField = metadata.requiredFields.find((field) => field.field === 'siteKey');
  const secretKeyField = metadata.requiredFields.find((field) => field.field === 'secretKey');
  const projectIdField = metadata.requiredFields.find((field) => field.field === 'projectId');
  const domainField = metadata.requiredFields.find((field) => field.field === 'domain');
  const modeField = metadata.requiredFields.find((field) => field.field === 'mode');
  const regionField = metadata.requiredFields.find((field) => field.field === 'region');
  const prefixField = metadata.requiredFields.find((field) => field.field === 'prefix');
  const sceneIdField = metadata.requiredFields.find((field) => field.field === 'sceneId');
  const accessKeyIdField = metadata.requiredFields.find((field) => field.field === 'accessKeyId');
  const accessKeySecretField = metadata.requiredFields.find(
    (field) => field.field === 'accessKeySecret'
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <>
      {siteKeyField && (
        <FormField isRequired title={siteKeyField.label}>
          <TextInput
            error={Boolean(errors.siteKey)}
            placeholder={String(t(siteKeyField.placeholder))}
            {...register('siteKey', { required: true })}
          />
        </FormField>
      )}
      {secretKeyField && (
        <FormField isRequired title={secretKeyField.label}>
          <TextInput
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.secretKey)}
            placeholder={String(t(secretKeyField.placeholder))}
            {...register('secretKey', { required: true })}
          />
        </FormField>
      )}
      {projectIdField && (
        <FormField isRequired title={projectIdField.label}>
          <TextInput
            error={Boolean(errors.projectId)}
            placeholder={String(t(projectIdField.placeholder))}
            {...register('projectId', { required: true })}
          />
        </FormField>
      )}
      {domainField && (
        <FormField isRequired={!domainField.isOptional} title={domainField.label}>
          <TextInput
            error={Boolean(errors.domain)}
            placeholder={String(t(domainField.placeholder))}
            {...register('domain', { required: !domainField.isOptional })}
          />
        </FormField>
      )}
      {modeField && (
        <>
          <FormField title={modeField.label}>
            <Controller
              name="mode"
              control={control}
              defaultValue={RecaptchaEnterpriseMode.Invisible}
              render={({ field: { onChange, value } }) => (
                <RadioGroup name="mode" value={value} onChange={onChange}>
                  <Radio
                    title="security.captcha_details.mode_invisible"
                    value={RecaptchaEnterpriseMode.Invisible}
                  />
                  <Radio
                    title="security.captcha_details.mode_checkbox"
                    value={RecaptchaEnterpriseMode.Checkbox}
                  />
                </RadioGroup>
              )}
            />
          </FormField>
          <InlineNotification className={styles.modeNotice} severity="alert">
            {t('security.captcha_details.mode_notice')}
          </InlineNotification>
        </>
      )}
      {regionField && (
        <FormField isRequired title={regionField.label}>
          <Controller
            name="region"
            control={control}
            defaultValue={AliyunCaptchaRegion.China}
            render={({ field: { onChange, value } }) => (
              <RadioGroup name="region" value={value} onChange={onChange}>
                <Radio
                  title="security.captcha_details.aliyun_region_china"
                  value={AliyunCaptchaRegion.China}
                />
                <Radio
                  title="security.captcha_details.aliyun_region_singapore"
                  value={AliyunCaptchaRegion.Singapore}
                />
              </RadioGroup>
            )}
          />
        </FormField>
      )}
      {prefixField && (
        <FormField isRequired title={prefixField.label}>
          <TextInput
            error={Boolean(errors.prefix)}
            placeholder={String(t(prefixField.placeholder))}
            {...register('prefix', { required: true })}
          />
        </FormField>
      )}
      {sceneIdField && (
        <FormField isRequired title={sceneIdField.label}>
          <TextInput
            error={Boolean(errors.sceneId)}
            placeholder={String(t(sceneIdField.placeholder))}
            {...register('sceneId', { required: true })}
          />
        </FormField>
      )}
      {accessKeyIdField && (
        <FormField isRequired title={accessKeyIdField.label}>
          <TextInput
            autoComplete="off"
            error={Boolean(errors.accessKeyId)}
            placeholder={String(t(accessKeyIdField.placeholder))}
            {...register('accessKeyId', { required: true })}
          />
        </FormField>
      )}
      {accessKeySecretField && (
        <FormField isRequired title={accessKeySecretField.label}>
          <TextInput
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.accessKeySecret)}
            placeholder={String(t(accessKeySecretField.placeholder))}
            {...register('accessKeySecret', { required: true })}
          />
        </FormField>
      )}
    </>
  );
}

export default CaptchaFormFields;
