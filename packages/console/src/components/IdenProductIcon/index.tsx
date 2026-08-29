import classNames from 'classnames';

import connectors from '@/assets/images/iden-product-icons/connectors.png';
import email from '@/assets/images/iden-product-icons/email.png';
import machineToMachine from '@/assets/images/iden-product-icons/machine-to-machine.png';
import protectedApp from '@/assets/images/iden-product-icons/protected-app.png';
import signInPreview from '@/assets/images/iden-product-icons/sign-in-preview.png';
import sms from '@/assets/images/iden-product-icons/sms.png';

import styles from './index.module.scss';

const sources = Object.freeze({
  connectors,
  email,
  machineToMachine,
  protectedApp,
  signInPreview,
  sms,
});

export type IdenProductIconName = keyof typeof sources;

type Props = {
  readonly name: IdenProductIconName;
  readonly className?: string;
  readonly isDark?: boolean;
};

export function IdenProductIcon({ name, className, isDark = false }: Props) {
  return (
    <img
      aria-hidden
      alt=""
      className={classNames(styles.icon, isDark && styles.dark, className)}
      src={sources[name]}
    />
  );
}
