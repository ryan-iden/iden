import { StateArtwork } from '@iden/ui-foundation/react';

import styles from './App.module.scss';
import useInterfaceTranslation from './i18n/use-interface-translation';
import { isCloudBuild } from './product-brand';

const RetryPanel = ({
  isExpired,
  error,
  onRetry,
}: {
  readonly isExpired: boolean;
  readonly error: string;
  readonly onRetry: () => Promise<void>;
}) => {
  const { t: tUi } = useInterfaceTranslation();
  return (
    <div className={styles.errorContainer}>
      {!isCloudBuild && <StateArtwork kind="error" className={styles.congratsIcon} />}
      <div className={styles.errorTitle}>
        {isExpired ? tUi('device_expired') : tUi('generic_error')}
      </div>
      <div className={styles.errorMessage}>
        {isExpired ? tUi('device_expired_description') : error}
      </div>
      <button
        data-iden-press=""
        type="button"
        className={styles.primaryButton}
        onClick={() => {
          void onRetry();
        }}
      >
        {tUi('try_again')}
      </button>
    </div>
  );
};

export default RetryPanel;
