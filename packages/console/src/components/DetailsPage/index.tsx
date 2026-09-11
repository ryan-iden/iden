import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { type To } from 'react-router-dom';

import Back from '@/assets/icons/back.svg?react';
import type DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import FlipOnRtl from '@/ds-components/FlipOnRtl';
import TextLink from '@/ds-components/TextLink';
import type { RequestError } from '@/hooks/use-api';

import RequestDataError from '../RequestDataError';

import Skeleton from './Skeleton';
import styles from './index.module.scss';

type Props = {
  readonly backLink: To;
  readonly backLinkTitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly isLoading?: boolean;
  readonly error?: RequestError;
  readonly onRetry?: () => void;
  readonly children: ReactNode;
  readonly className?: string;
  readonly topAction?: ReactNode;
};

function DetailsPage({
  backLink,
  backLinkTitle,
  isLoading,
  error,
  onRetry,
  children,
  className,
  topAction,
}: Props) {
  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.backRow}>
        <TextLink
          to={backLink}
          icon={
            <FlipOnRtl>
              <Back />
            </FlipOnRtl>
          }
          className={styles.backLink}
        >
          {typeof backLinkTitle === 'string' ? <DynamicT forKey={backLinkTitle} /> : backLinkTitle}
        </TextLink>
        {topAction}
      </div>
      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <RequestDataError error={error} onRetry={onRetry} />
      ) : (
        children
      )}
    </div>
  );
}

export default DetailsPage;
