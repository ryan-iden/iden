import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import { buildAccountNavItems } from '@ac/components/account-nav-items';
import { isDevFeaturesEnabled } from '@ac/constants/env';

import {
  hasVisibleProfilePage,
  hasVisibleSecuritySection,
  hasVisibleSessionsPage,
} from './security-page';

type AccountTabSettings = {
  readonly accountCenterSettings?: PageContextType['accountCenterSettings'];
  readonly experienceSettings?: PageContextType['experienceSettings'];
};

export const getAccountTabSettings = ({
  accountCenterSettings,
  experienceSettings,
}: AccountTabSettings) => {
  // DEV: MFA trusted device management
  const hasSecurity = hasVisibleSecuritySection(
    accountCenterSettings,
    experienceSettings,
    isDevFeaturesEnabled
  );
  const hasSessions = hasVisibleSessionsPage(accountCenterSettings);
  const hasProfile = hasVisibleProfilePage(accountCenterSettings, experienceSettings);
  const hasOrganizations = accountCenterSettings?.organizationCenter.enabled === true;

  return {
    hasProfile,
    hasSecurity,
    hasSessions,
    hasOrganizations,
    navItems: buildAccountNavItems({
      hasProfile,
      hasSecurity,
      hasSessions,
      hasOrganizations,
    }),
  };
};
