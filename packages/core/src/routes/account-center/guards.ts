import {
  AccountCenters,
  accountCenterFieldControlGuard,
  organizationCenterSettingsGuard,
  publicOrganizationCenterSettingsGuard,
} from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const getAccountCenterApiGuards = () => {
  // DEV: MFA trusted devices
  const trustedDeviceOmitMask = EnvSet.values.isDevFeaturesEnabled
    ? {}
    : { trustedDevice: true as const };
  const fields = accountCenterFieldControlGuard.omit(trustedDeviceOmitMask);
  const isOrganizationCenterAvailable =
    !EnvSet.values.isCloud && EnvSet.values.isSelfHostedParityEnabled;
  const organizationCenterOmitMask = isOrganizationCenterAvailable
    ? {}
    : { organizationCenter: true as const };
  const accountCenter = AccountCenters.guard
    .extend({ fields, organizationCenter: organizationCenterSettingsGuard })
    .omit(organizationCenterOmitMask);
  const publicAccountCenter = AccountCenters.guard
    .extend({ fields, organizationCenter: publicOrganizationCenterSettingsGuard })
    .omit(organizationCenterOmitMask);

  return {
    fields,
    organizationCenter: isOrganizationCenterAvailable ? organizationCenterSettingsGuard : undefined,
    accountCenter,
    publicAccountCenter,
  };
};
