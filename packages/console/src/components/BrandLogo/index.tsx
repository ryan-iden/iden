import classNames from 'classnames';

import CloudLogo from '@/assets/images/cloud-logo.svg?react';
import { brandProfile, isCloud } from '@/consts/env';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly onClick?: () => void;
};

function BrandLogo({ className, onClick }: Props) {
  if (isCloud) {
    return (
      <CloudLogo
        aria-label={brandProfile.productName}
        className={className}
        role="button"
        onClick={onClick}
      />
    );
  }

  return (
    <button
      aria-label={brandProfile.productName}
      className={classNames(styles.logo, className)}
      type="button"
      onClick={onClick}
    >
      <span aria-hidden className={styles.mark} />
      <span className={styles.name}>{brandProfile.productName}</span>
    </button>
  );
}

export default BrandLogo;
