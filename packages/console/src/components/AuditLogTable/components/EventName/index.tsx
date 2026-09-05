import { type Log } from '@logto/schemas';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import Failed from '@/assets/icons/failed.svg?react';
import Success from '@/assets/icons/success.svg?react';
import Tag from '@/ds-components/Tag';
import useInterfaceTranslation from '@/hooks/use-interface-translation';
import useLogEventTitle from '@/hooks/use-log-event-title';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';
import { isImpersonationLog } from './utils';

type Props = {
  readonly eventKey: string;
  readonly isSuccess: boolean;
  readonly payload: Log['payload'];
  readonly to?: string;
};

function EventName({ eventKey, payload, isSuccess, to }: Props) {
  const getEventTitle = useLogEventTitle();
  const { t: tUi } = useInterfaceTranslation();
  const title = getEventTitle(eventKey);
  const { getTo } = useTenantPathname();

  return (
    <div className={styles.eventName}>
      <div className={classNames(styles.icon, isSuccess ? styles.success : styles.fail)}>
        {isSuccess ? <Success /> : <Failed />}
      </div>
      {to && (
        <Link
          className={styles.title}
          to={getTo(to)}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {title}
        </Link>
      )}
      {!to && <div className={styles.title}>{title}</div>}
      {isImpersonationLog({
        key: eventKey,
        payload,
      }) && <Tag status="alert">{tUi('impersonation')}</Tag>}
    </div>
  );
}

export default EventName;
