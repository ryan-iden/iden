import ReactModal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import ExternalLink from '@/assets/icons/external-link.svg?react';
import IconButton from '@/ds-components/IconButton';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly url: string;
  readonly onClose: () => void;
};

function HelpDrawer({ isOpen, url, onClose }: Props) {
  const { t: tUi } = useInterfaceTranslation();
  return (
    <ReactModal
      shouldCloseOnOverlayClick
      aria={{ labelledby: 'iden-help-drawer-title' }}
      role="dialog"
      isOpen={isOpen}
      className={styles.drawer}
      overlayClassName={styles.overlay}
      closeTimeoutMS={220}
      onRequestClose={onClose}
    >
      <header className={styles.header}>
        <div>
          <div id="iden-help-drawer-title" className={styles.title}>
            {tUi('help_title')}
          </div>
          <div className={styles.subtitle}>{tUi('help_subtitle')}</div>
        </div>
        <div className={styles.actions}>
          <a aria-label={tUi('open_help')} className={styles.expand} href={url}>
            <ExternalLink />
          </a>
          <IconButton aria-label={tUi('close_help')} size="large" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </header>
      <iframe
        className={styles.frame}
        sandbox="allow-scripts"
        src={`${url}${url.includes('?') ? '&' : '?'}embedded=1`}
        title={tUi('help_title')}
      />
    </ReactModal>
  );
}

export default HelpDrawer;
