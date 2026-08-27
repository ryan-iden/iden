import { TenantTag } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (tenant?: TenantResponse) => void;
};

type FormData = { name: string };

/** Minimal tenant creator for a single self-hosted instance. */
function SelfHostedCreateTenantModal({ isOpen, onClose }: Props) {
  const api = useCloudApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ name }) => {
      const tenant = await api.post('/api/tenants', {
        body: { name, tag: TenantTag.Development, regionName: 'self-hosted' },
      });
      toast.success(t('tenants.create_modal.tenant_created'));
      onClose(tenant);
    })
  );

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onAfterClose={() => {
        reset();
      }}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="tenants.create_modal.title"
        subtitle="tenants.create_modal.subtitle"
        footer={
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            htmlType="submit"
            title="tenants.create_modal.create_button"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={() => {
          onClose();
        }}
      >
        <FormField isRequired title="tenants.settings.tenant_name">
          <TextInput
            error={errors.name?.message}
            {...register('name', {
              required: t('errors.required_field_missing', {
                field: t('tenants.settings.tenant_name'),
              }),
            })}
          />
        </FormField>
      </ModalLayout>
    </Modal>
  );
}

export default SelfHostedCreateTenantModal;
