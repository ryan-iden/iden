import { useFormContext } from 'react-hook-form';

import { latestProPlanId } from '@/consts/subscriptions';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import type { SignInExperienceForm } from '../../../types';

type Props = {
  readonly hasPlanTag: boolean;
  readonly isEnabled: boolean;
};

function HideLogtoBrandingField({ hasPlanTag, isEnabled }: Props) {
  const { register } = useFormContext<SignInExperienceForm>();

  return (
    <FormField
      title="sign_in_exp.branding.hide_logto_branding"
      featureTag={
        hasPlanTag
          ? {
              isVisible: !isEnabled,
              plan: latestProPlanId,
            }
          : undefined
      }
    >
      <Switch
        description="sign_in_exp.branding.hide_logto_branding_description"
        {...register('hideLogtoBranding')}
        disabled={!isEnabled}
      />
    </FormField>
  );
}

export default HideLogtoBrandingField;
