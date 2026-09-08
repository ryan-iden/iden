import { useSurfaceMotion } from '@iden/ui-foundation/react';
import { useEffect, useRef } from 'react';
import ReactModal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import ExternalLink from '@/assets/icons/external-link.svg?react';
import IconButton from '@/ds-components/IconButton';
import useInterfaceTranslation from '@/hooks/use-interface-translation';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly url: string;
  readonly onClose: () => void;
};

function HelpDrawer({ isOpen, url, onClose }: Props) {
  const { t: tUi } = useInterfaceTranslation();
  const theme = useTheme();
  const initialTheme = useRef(theme);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameUrl = new URL(url, window.location.origin);
  const isTrustedHelp =
    frameUrl.origin === window.location.origin && frameUrl.pathname.startsWith('/help/');
  frameUrl.searchParams.set('embedded', '1');
  frameUrl.searchParams.set('theme', initialTheme.current);
  const syncFrameTheme = () => {
    if (isTrustedHelp) {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'iden:appearance', theme },
        window.location.origin
      );
    }
  };
  useEffect(syncFrameTheme, [theme, isOpen, isTrustedHelp]);
  const headerRef = useRef<HTMLElement>(null);
  useSurfaceMotion(headerRef, String(isOpen), isTrustedHelp);
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
      <header ref={headerRef} className={styles.header}>
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
        ref={frameRef}
        data-iden-help=""
        className={styles.frame}
        sandbox={isTrustedHelp ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
        src={frameUrl.href}
        title={tUi('help_title')}
        onLoad={syncFrameTheme}
      />
    </ReactModal>
  );
}

export default HelpDrawer;
