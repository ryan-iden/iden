import classNames from 'classnames';

import useInterfaceTranslation from '@/hooks/use-interface-translation';

/**
 * BetaTag static component
 *
 * Used to indicate that a new released feature is in beta.
 */

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function BetaTag({ className }: Props) {
  const { t: tUi } = useInterfaceTranslation();
  return <div className={classNames(styles.tag, styles.beta, className)}>{tUi('beta')}</div>;
}

export default BetaTag;
