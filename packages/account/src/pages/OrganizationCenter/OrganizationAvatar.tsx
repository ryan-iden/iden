import { Blobatar } from '@blobatar/react';
import classNames from 'classnames';

import styles from './OrganizationAvatar.module.scss';

type Props = {
  readonly seed: string;
  readonly src?: string;
  readonly size?: number;
  readonly className?: string;
};

const OrganizationAvatar = ({ seed, src, size = 44, className }: Props) =>
  src ? (
    <img
      alt=""
      className={classNames(styles.avatar, className)}
      draggable={false}
      height={size}
      referrerPolicy="no-referrer"
      src={src}
      width={size}
    />
  ) : (
    <Blobatar
      alt=""
      background="squircle"
      className={className}
      draggable={false}
      name={`organization:${seed}`}
      size={size}
    />
  );

export default OrganizationAvatar;
