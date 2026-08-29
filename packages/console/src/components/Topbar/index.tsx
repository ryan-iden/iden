import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContactIcon from '@/assets/icons/contact-us.svg?react';
import DocumentIcon from '@/assets/icons/document-nav-button.svg?react';
import BrandLogo from '@/components/BrandLogo';
import { isCloud, isTenantManagementEnabled } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import Spacer from '@/ds-components/Spacer';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';

import ContactModal from './ContactModal';
import EnterpriseSubscriptions from './EnterpriseSubscriptions';
import InkeepAskAi from './InkeepAskAi';
import TenantSelector from './TenantSelector';
import UserInfo from './UserInfo';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  /* eslint-disable react/boolean-prop-naming */
  readonly hideTenantSelector?: boolean;
  readonly hideTitle?: boolean;
  /* eslint-enable react/boolean-prop-naming */
};

function Topbar({ className, hideTenantSelector, hideTitle }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  return (
    <div className={classNames(styles.topbar, className)}>
      <BrandLogo
        className={styles.logo}
        onClick={() => {
          navigate('/');
        }}
      />
      {isTenantManagementEnabled && !hideTenantSelector && <TenantSelector />}
      {!isCloud && !hideTitle && (
        <>
          <div className={styles.line} />
          <div className={styles.text}>{t('title')}</div>
        </>
      )}
      <Spacer />
      {isCloud && <InkeepAskAi className={styles.button} />}
      {isCloud && <EnterpriseSubscriptions className={styles.button} />}
      <DocumentButton />
      {isCloud && <HelpButton />}
      <UserInfo />
    </div>
  );
}

export default Topbar;

function DocumentButton() {
  const { documentationSiteUrl } = useDocumentationUrl();
  return (
    <TextLink
      href={documentationSiteUrl}
      targetBlank={false}
      className={styles.button}
      icon={<DocumentIcon className={styles.icon} />}
    >
      <DynamicT forKey="topbar.docs" />
    </TextLink>
  );
}

function HelpButton() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={anchorRef}
        tabIndex={0}
        className={styles.button}
        role="button"
        onKeyDown={onKeyDownHandler(() => {
          setIsContactOpen(true);
        })}
        onClick={() => {
          setIsContactOpen(true);
        }}
      >
        <ContactIcon className={styles.icon} />
        <span>
          <DynamicT forKey="topbar.help" />
        </span>
      </div>
      <ContactModal
        isOpen={isContactOpen}
        onCancel={() => {
          setIsContactOpen(false);
        }}
      />
    </>
  );
}
