import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import emptyDark from '@/assets/images/iden-states/empty-dark.png';
import empty from '@/assets/images/iden-states/empty.png';
import noResultsDark from '@/assets/images/iden-states/no-results-dark.png';
import noResults from '@/assets/images/iden-states/no-results.png';
import requestErrorDark from '@/assets/images/iden-states/request-error-dark.png';
import requestError from '@/assets/images/iden-states/request-error.png';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

const sources = Object.freeze({
  empty: { light: empty, dark: emptyDark },
  noResults: { light: noResults, dark: noResultsDark },
  requestError: { light: requestError, dark: requestErrorDark },
});

type IdenStateIllustrationName = keyof typeof sources;

type Props = {
  readonly name: IdenStateIllustrationName;
  readonly className?: string;
};

export function IdenStateIllustration({ name, className }: Props) {
  const theme = useTheme();
  const source = theme === Theme.Dark ? sources[name].dark : sources[name].light;

  return (
    <img aria-hidden alt="" className={classNames(styles.illustration, className)} src={source} />
  );
}
