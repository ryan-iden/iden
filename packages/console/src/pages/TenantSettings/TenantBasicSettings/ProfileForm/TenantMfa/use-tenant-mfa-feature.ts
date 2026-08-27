import { useContext } from 'react';

import { isSelfHostedParityEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { isPaidPlan } from '@/utils/subscription';

const useTenantMfaFeature = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  return {
    // Whether to show the paywall tag. Note: FeatureTag component handles dev tenant display
    // automatically, so we don't need to include isDevTenant here.
    shouldShowPaywallTag: !isSelfHostedParityEnabled && !isPaidTenant,
    // Dev tenants can use all features for testing purposes
    isFeatureAvailable: isSelfHostedParityEnabled || isDevTenant || isPaidTenant,
  };
};

export default useTenantMfaFeature;
