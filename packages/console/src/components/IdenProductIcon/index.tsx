import apiResourceDark from '@iden/ui-foundation/assets/api-resource-dark.svg?url';
import apiResource from '@iden/ui-foundation/assets/api-resource.svg?url';
import connectorsDark from '@iden/ui-foundation/assets/connectors-dark.svg?url';
import connectors from '@iden/ui-foundation/assets/connectors.svg?url';
import deviceFlowAppDark from '@iden/ui-foundation/assets/device-flow-app-dark.svg?url';
import deviceFlowApp from '@iden/ui-foundation/assets/device-flow-app.svg?url';
import emailDark from '@iden/ui-foundation/assets/email-dark.svg?url';
import email from '@iden/ui-foundation/assets/email.svg?url';
import machineToMachineDark from '@iden/ui-foundation/assets/machine-to-machine-dark.svg?url';
import machineToMachine from '@iden/ui-foundation/assets/machine-to-machine.svg?url';
import managementApiDark from '@iden/ui-foundation/assets/management-api-dark.svg?url';
import managementApi from '@iden/ui-foundation/assets/management-api.svg?url';
import nativeAppDark from '@iden/ui-foundation/assets/native-app-dark.svg?url';
import nativeApp from '@iden/ui-foundation/assets/native-app.svg?url';
import organizationsDark from '@iden/ui-foundation/assets/organizations-dark.svg?url';
import organizations from '@iden/ui-foundation/assets/organizations.svg?url';
import protectedAppDark from '@iden/ui-foundation/assets/protected-app-dark.svg?url';
import protectedApp from '@iden/ui-foundation/assets/protected-app.svg?url';
import roleAccessDark from '@iden/ui-foundation/assets/role-access-dark.svg?url';
import roleAccess from '@iden/ui-foundation/assets/role-access.svg?url';
import signInPreviewDark from '@iden/ui-foundation/assets/sign-in-preview-dark.svg?url';
import signInPreview from '@iden/ui-foundation/assets/sign-in-preview.svg?url';
import singlePageAppDark from '@iden/ui-foundation/assets/single-page-app-dark.svg?url';
import singlePageApp from '@iden/ui-foundation/assets/single-page-app.svg?url';
import smsDark from '@iden/ui-foundation/assets/sms-dark.svg?url';
import sms from '@iden/ui-foundation/assets/sms.svg?url';
import thirdPartyAppDark from '@iden/ui-foundation/assets/third-party-app-dark.svg?url';
import thirdPartyApp from '@iden/ui-foundation/assets/third-party-app.svg?url';
import traditionalWebAppDark from '@iden/ui-foundation/assets/traditional-web-app-dark.svg?url';
import traditionalWebApp from '@iden/ui-foundation/assets/traditional-web-app.svg?url';
import webhookDark from '@iden/ui-foundation/assets/webhook-dark.svg?url';
import webhook from '@iden/ui-foundation/assets/webhook.svg?url';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

const sources = Object.freeze({
  connectors: { light: connectors, dark: connectorsDark },
  deviceFlowApp: { light: deviceFlowApp, dark: deviceFlowAppDark },
  email: { light: email, dark: emailDark },
  machineToMachine: { light: machineToMachine, dark: machineToMachineDark },
  managementApi: { light: managementApi, dark: managementApiDark },
  nativeApp: { light: nativeApp, dark: nativeAppDark },
  organizations: { light: organizations, dark: organizationsDark },
  protectedApp: { light: protectedApp, dark: protectedAppDark },
  roleAccess: { light: roleAccess, dark: roleAccessDark },
  singlePageApp: { light: singlePageApp, dark: singlePageAppDark },
  signInPreview: { light: signInPreview, dark: signInPreviewDark },
  sms: { light: sms, dark: smsDark },
  thirdPartyApp: { light: thirdPartyApp, dark: thirdPartyAppDark },
  traditionalWebApp: { light: traditionalWebApp, dark: traditionalWebAppDark },
  apiResource: { light: apiResource, dark: apiResourceDark },
  webhook: { light: webhook, dark: webhookDark },
});

export type IdenProductIconName = keyof typeof sources;

type Props = {
  readonly name: IdenProductIconName;
  readonly className?: string;
  readonly isDark?: boolean;
  readonly size?: number;
};

export function IdenProductIcon({ name, className, isDark = false, size }: Props) {
  const theme = useTheme();
  const source = isDark || theme === Theme.Dark ? sources[name].dark : sources[name].light;
  const resolvedSize = size ?? (className ? undefined : 40);

  return (
    <img
      aria-hidden
      alt=""
      className={classNames(styles.icon, className)}
      src={source}
      style={resolvedSize ? { width: resolvedSize, height: resolvedSize } : undefined}
    />
  );
}
