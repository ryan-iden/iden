import OrganizationPreview from '@/assets/icons/organization-preview.svg?react';
import { isCloud } from '@/consts/env';

import { IdenProductIcon } from '../IdenProductIcon';
import ThemedIcon from '../ThemedIcon';

type Props = {
  readonly size?: number;
};

/** Render the active product's organization icon without leaking inherited visual branding. */
function OrganizationIcon({ size = 40 }: Props) {
  return isCloud ? (
    <ThemedIcon for={OrganizationPreview} size={size} />
  ) : (
    <IdenProductIcon name="organizations" size={size} />
  );
}

export default OrganizationIcon;
