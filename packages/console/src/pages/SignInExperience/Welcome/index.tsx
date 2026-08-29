import { Theme } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WelcomeImageDark from '@/assets/images/sign-in-experience-welcome-dark.svg?react';
import WelcomeImage from '@/assets/images/sign-in-experience-welcome.svg?react';
import { IdenStateIllustration } from '@/components/IdenStateIllustration';
import { isIdenBrand } from '@/consts/brand';
import Button from '@/ds-components/Button';
import useTheme from '@/hooks/use-theme';

import GuideModal from './GuideModal';
import styles from './index.module.scss';

type Props = {
  readonly mutate: () => void;
};

function Welcome({ mutate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const WelcomeIcon = theme === Theme.Light ? WelcomeImage : WelcomeImageDark;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {isIdenBrand ? (
          <IdenStateIllustration className={styles.icon} name="empty" />
        ) : (
          <WelcomeIcon className={styles.icon} />
        )}
        <div className={styles.wrapper}>
          <div className={styles.title}>{t('sign_in_exp.welcome.title')}</div>
          <div className={styles.description}>{t('sign_in_exp.welcome.description')}</div>
          <Button
            title="sign_in_exp.welcome.get_started"
            type="primary"
            onClick={() => {
              setIsOpen(true);
            }}
          />
        </div>
      </div>
      <GuideModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          mutate();
        }}
      />
    </div>
  );
}

export default Welcome;
