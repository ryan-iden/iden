import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import apiResourceDark from '@/assets/images/iden-product-icons/api-resource-dark.svg?url';
import apiResource from '@/assets/images/iden-product-icons/api-resource.svg?url';
import connectorsDark from '@/assets/images/iden-product-icons/connectors-dark.png';
import connectors from '@/assets/images/iden-product-icons/connectors.png';
import deviceFlowAppDark from '@/assets/images/iden-product-icons/device-flow-app-dark.svg?url';
import deviceFlowApp from '@/assets/images/iden-product-icons/device-flow-app.svg?url';
import emailDark from '@/assets/images/iden-product-icons/email-dark.png';
import email from '@/assets/images/iden-product-icons/email.png';
import machineToMachineDark from '@/assets/images/iden-product-icons/machine-to-machine-dark.png';
import machineToMachine from '@/assets/images/iden-product-icons/machine-to-machine.png';
import managementApiDark from '@/assets/images/iden-product-icons/management-api-dark.png';
import managementApi from '@/assets/images/iden-product-icons/management-api.png';
import nativeAppDark from '@/assets/images/iden-product-icons/native-app-dark.svg?url';
import nativeApp from '@/assets/images/iden-product-icons/native-app.svg?url';
import organizationsDark from '@/assets/images/iden-product-icons/organizations-dark.png';
import organizations from '@/assets/images/iden-product-icons/organizations.png';
import protectedAppDark from '@/assets/images/iden-product-icons/protected-app-dark.png';
import protectedApp from '@/assets/images/iden-product-icons/protected-app.png';
import roleAccessDark from '@/assets/images/iden-product-icons/role-access-dark.png';
import roleAccess from '@/assets/images/iden-product-icons/role-access.png';
import signInPreviewDark from '@/assets/images/iden-product-icons/sign-in-preview-dark.png';
import signInPreview from '@/assets/images/iden-product-icons/sign-in-preview.png';
import singlePageAppDark from '@/assets/images/iden-product-icons/single-page-app-dark.svg?url';
import singlePageApp from '@/assets/images/iden-product-icons/single-page-app.svg?url';
import smsDark from '@/assets/images/iden-product-icons/sms-dark.png';
import sms from '@/assets/images/iden-product-icons/sms.png';
import thirdPartyAppDark from '@/assets/images/iden-product-icons/third-party-app-dark.svg?url';
import thirdPartyApp from '@/assets/images/iden-product-icons/third-party-app.svg?url';
import traditionalWebAppDark from '@/assets/images/iden-product-icons/traditional-web-app-dark.svg?url';
import traditionalWebApp from '@/assets/images/iden-product-icons/traditional-web-app.svg?url';
import webhookDark from '@/assets/images/iden-product-icons/webhook-dark.svg?url';
import webhook from '@/assets/images/iden-product-icons/webhook.svg?url';
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
