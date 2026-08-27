import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

const useApplicationsUsage = () => {
  const { hasReachedSubscriptionQuotaLimit, hasSurpassedSubscriptionQuotaLimit } =
    useContext(SubscriptionDataContext);

  const hasMachineToMachineAppsReachedLimit =
    isCloud && hasReachedSubscriptionQuotaLimit('machineToMachineLimit');

  const hasMachineToMachineAppsSurpassedLimit =
    isCloud && hasSurpassedSubscriptionQuotaLimit('machineToMachineLimit');

  const hasThirdPartyAppsReachedLimit =
    isCloud && hasReachedSubscriptionQuotaLimit('thirdPartyApplicationsLimit');

  const hasAppsReachedLimit = isCloud && hasReachedSubscriptionQuotaLimit('applicationsLimit');

  const hasSamlAppsReachedLimit =
    isCloud && hasReachedSubscriptionQuotaLimit('samlApplicationsLimit');

  const hasSamlAppsSurpassedLimit =
    isCloud && hasSurpassedSubscriptionQuotaLimit('samlApplicationsLimit');

  return {
    hasMachineToMachineAppsReachedLimit,
    hasMachineToMachineAppsSurpassedLimit,
    hasAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
    hasSamlAppsReachedLimit,
    hasSamlAppsSurpassedLimit,
  };
};

export default useApplicationsUsage;
