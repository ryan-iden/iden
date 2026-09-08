import { StateArtwork } from '@iden/ui-foundation/react';
import classNames from 'classnames';

import styles from './index.module.scss';

const sources = Object.freeze({
  empty: 'empty' as const,
  noResults: 'search' as const,
  requestError: 'error' as const,
});

type IdenStateIllustrationName = keyof typeof sources;

type Props = {
  readonly name: IdenStateIllustrationName;
  readonly className?: string;
};

export function IdenStateIllustration({ name, className }: Props) {
  return (
    <StateArtwork className={classNames(styles.illustration, className)} kind={sources[name]} />
  );
}
