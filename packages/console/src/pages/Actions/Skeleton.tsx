import Card from '@/ds-components/Card';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

import { actionCatalog } from './constants';
import styles from './index.module.scss';

function Skeleton() {
  const { t: tUi } = useInterfaceTranslation();
  return (
    <div className={styles.cardList} role="status" aria-label={tUi('loading')}>
      {actionCatalog.map(({ actionType }) => (
        <Card key={actionType} className={styles.skeletonCard}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonDescription} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Skeleton;
