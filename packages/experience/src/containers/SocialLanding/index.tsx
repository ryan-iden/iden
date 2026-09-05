import classNames from 'classnames';

import useConnectors from '@/hooks/use-connectors';
import { LoadingIcon } from '@/shared/components/LoadingLayer';
import useInterfaceTranslation from '@/shared/hooks/use-interface-translation';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly connectorId: string;
  readonly isLoading?: boolean;
};

const SocialLanding = ({ className, connectorId, isLoading = false }: Props) => {
  const { t: tUi } = useInterfaceTranslation();
  const { findConnectorById, getConnectorLogo } = useConnectors();
  const result = findConnectorById(connectorId);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.connector}>
        {result ? <img src={getConnectorLogo(result)} alt={tUi('logo')} /> : connectorId}
      </div>
      {isLoading && <LoadingIcon />}
    </div>
  );
};

export default SocialLanding;
