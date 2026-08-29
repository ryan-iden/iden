import { resolveDefaultAvatarSeed } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DefaultUserAvatar from '@/shared/components/DefaultUserAvatar';

import styles from './index.module.scss';

type Props = {
  readonly user: ConsentInfoResponse['user'];
  readonly className?: string;
};

const UserProfile = ({
  user: { id, avatar, name, primaryEmail, primaryPhone, username },
  className,
}: Props) => {
  const { t } = useTranslation();
  const avatarSeed = resolveDefaultAvatarSeed(id, primaryEmail, username, primaryPhone, name);

  return (
    <div className={classNames(styles.wrapper, className)}>
      {avatar ? (
        <img src={avatar} alt="avatar" className={styles.avatar} />
      ) : (
        <DefaultUserAvatar className={styles.avatar} seed={avatarSeed} />
      )}
      <div>
        <div className={styles.name}>{name ?? t('description.user_id', { id })}</div>
        <div className={styles.identifier}>{primaryEmail ?? primaryPhone ?? username}</div>
      </div>
    </div>
  );
};

export default UserProfile;
