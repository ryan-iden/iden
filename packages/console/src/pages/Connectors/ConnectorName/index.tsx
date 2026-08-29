import { ConnectorPlatform, ConnectorType, Theme } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import ConnectorLogo from '@/components/ConnectorLogo';
import { IdenProductIcon } from '@/components/IdenProductIcon';
import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';
import {
  connectorPlaceholderIcon,
  connectorPlatformLabel,
  connectorTitlePlaceHolder,
} from '@/consts/connectors';
import { isIdenBrand } from '@/consts/env';
import { ConnectorsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import DemoTag from './DemoTag';
import styles from './index.module.scss';

type Props = {
  readonly connectorGroup: ConnectorGroup;
  readonly isDemo?: boolean;
};

function ConnectorName({ connectorGroup, isDemo = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { type, connectors } = connectorGroup;
  const connector = connectors[0];
  const { navigate } = useTenantPathname();
  const theme = useTheme();
  const hasNonUniversalConnector = connectors.some(
    ({ platform }) => platform !== ConnectorPlatform.Universal
  );

  if (!connector) {
    const PlaceholderIcon = connectorPlaceholderIcon[type];
    const idenIconName =
      type === ConnectorType.Email ? 'email' : type === ConnectorType.Sms ? 'sms' : undefined;
    const shouldUseIdenIcon = Boolean(idenIconName) && isIdenBrand;

    return (
      <ItemPreview
        title={
          <div className={styles.previewTitle}>
            <div>{t(connectorTitlePlaceHolder[type])}</div>
            {type !== ConnectorType.Social && (
              <Button
                title="general.set_up"
                onClick={() => {
                  navigate(`/connectors/${ConnectorsTabs.Passwordless}/create/${type}`);
                }}
              />
            )}
          </div>
        }
        icon={
          <div className={styles.logoContainer}>
            {shouldUseIdenIcon && idenIconName ? (
              <IdenProductIcon
                className={styles.logo}
                isDark={theme === Theme.Dark}
                name={idenIconName}
              />
            ) : (
              PlaceholderIcon && <PlaceholderIcon className={styles.logo} />
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <ItemPreview
        title={<UnnamedTrans resource={connector.name} />}
        subtitle={
          type === ConnectorType.Social &&
          hasNonUniversalConnector && (
            <div className={styles.platforms}>
              {connectors.map(
                ({ id, platform }) =>
                  platform && (
                    <div key={id} className={styles.platform}>
                      <ConnectorPlatformIcon platform={platform} />
                      {t(connectorPlatformLabel[platform])}
                    </div>
                  )
              )}
            </div>
          )
        }
        icon={<ConnectorLogo data={connector} />}
        to={conditional(
          !isDemo &&
            `/connectors/${
              connector.type === ConnectorType.Social
                ? ConnectorsTabs.Social
                : ConnectorsTabs.Passwordless
            }/${connector.id}`
        )}
      />
      {isDemo && <DemoTag connectorType={connector.type} />}
    </div>
  );
}

export default ConnectorName;
