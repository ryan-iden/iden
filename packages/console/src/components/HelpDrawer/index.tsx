import ReactModal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import ExternalLink from '@/assets/icons/external-link.svg?react';
import IconButton from '@/ds-components/IconButton';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly url: string;
  readonly onClose: () => void;
};

function HelpDrawer({ isOpen, url, onClose }: Props) {
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
            iden Help Center
          </div>
          <div className={styles.subtitle}>Guidance without leaving your workspace</div>
        </div>
        <div className={styles.actions}>
          <a aria-label="Open full help page" className={styles.expand} href={url}>
            <ExternalLink />
          </a>
          <IconButton aria-label="Close help" size="large" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </header>
      <iframe
        className={styles.frame}
        sandbox="allow-scripts"
        src={`${url}${url.includes('?') ? '&' : '?'}embedded=1`}
        title="iden Help Center"
      />
    </ReactModal>
  );
}

export default HelpDrawer;
