import { getTenantPath } from '@/utils/tenant-path';

type GetOssOnboardingRedirectPathOptions = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  isProduction: boolean;
  hasError: boolean;
  isLoading: boolean;
  isOnboardingDone: boolean;
  isSelfHostedParityEnabled?: boolean;
  tenantId: string;
  pathname: string;
};

const onboardingPath = 'onboarding';

export const getOssOnboardingRedirectPath = ({
  isCloud,
  isDevFeaturesEnabled,
  isProduction,
  hasError,
  isLoading,
  isOnboardingDone,
  isSelfHostedParityEnabled = false,
  tenantId,
  pathname,
}: GetOssOnboardingRedirectPathOptions): string | undefined => {
  if (
    isCloud ||
    !isDevFeaturesEnabled ||
    !isProduction ||
    hasError ||
    isLoading ||
    isOnboardingDone ||
    pathname.endsWith(`/${onboardingPath}`)
  ) {
    return;
  }

  return getTenantPath(tenantId, onboardingPath, {
    isSelfHostedTenantManagementEnabled: isSelfHostedParityEnabled,
  });
};
