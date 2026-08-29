import { ApplicationType, Theme } from '@logto/schemas';

import { IdenProductIcon, type IdenProductIconName } from '@/components/IdenProductIcon';
import {
  darkModeApplicationIconMap,
  deviceFlowApplicationIcon,
  deviceFlowApplicationIconDark,
  lightModeApplicationIconMap,
  thirdPartyApplicationIcon,
  thirdPartyApplicationIconDark,
} from '@/consts';
import { isCloud } from '@/consts/env';
import useTheme from '@/hooks/use-theme';

type Props = {
  readonly type: ApplicationType;
  readonly className?: string;
  readonly isThirdParty?: boolean;
  readonly isDeviceFlow?: boolean;
};

const selfHostedApplicationIcons = Object.freeze({
  [ApplicationType.Native]: 'nativeApp',
  [ApplicationType.SPA]: 'singlePageApp',
  [ApplicationType.Traditional]: 'traditionalWebApp',
  [ApplicationType.MachineToMachine]: 'machineToMachine',
  [ApplicationType.Protected]: 'protectedApp',
} satisfies Record<Exclude<ApplicationType, ApplicationType.SAML>, IdenProductIconName>);

const getIcon = (
  type: ApplicationType,
  isLightMode: boolean,
  isThirdParty?: boolean,
  isDeviceFlow?: boolean
) => {
  // We have ensured that SAML applications are always third party in DB schema, we use `||` here to make TypeScript happy.
  // TODO: @darcy fix this when SAML application <Icon /> is ready
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (isThirdParty || type === ApplicationType.SAML) {
    return isLightMode ? thirdPartyApplicationIcon : thirdPartyApplicationIconDark;
  }

  if (isDeviceFlow && type === ApplicationType.Native) {
    return isLightMode ? deviceFlowApplicationIcon : deviceFlowApplicationIconDark;
  }

  return isLightMode ? lightModeApplicationIconMap[type] : darkModeApplicationIconMap[type];
};

function ApplicationIcon({ type, className, isThirdParty = false, isDeviceFlow = false }: Props) {
  const theme = useTheme();
  const isLightMode = theme === Theme.Light;

  if (!isCloud) {
    const name =
      isThirdParty || type === ApplicationType.SAML
        ? 'thirdPartyApp'
        : isDeviceFlow && type === ApplicationType.Native
          ? 'deviceFlowApp'
          : selfHostedApplicationIcons[type];

    return <IdenProductIcon className={className} name={name} />;
  }

  const Icon = getIcon(type, isLightMode, isThirdParty, isDeviceFlow);

  return <Icon className={className} />;
}

export default ApplicationIcon;
