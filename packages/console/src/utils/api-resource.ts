import { isManagementApi } from '@logto/schemas';

import { brandProfile, isIdenBrand } from '@/consts/brand';

/** Keep the inherited resource name intact in data while presenting the active product brand. */
export const getApiResourceDisplayName = (
  name: string,
  indicator: string,
  localizedName?: string
) =>
  isManagementApi(indicator)
    ? (localizedName ?? (isIdenBrand ? `${brandProfile.productName} Management API` : name))
    : name;
