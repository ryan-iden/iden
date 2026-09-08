import classNames from 'classnames';
import { Menu } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useInterfaceTranslation from '@/hooks/use-interface-translation';

import styles from './index.module.scss';

export default function ResponsiveNavigation({ children }: { readonly children: ReactNode }) {
  const { t: tUi } = useInterfaceTranslation();
  const { pathname, key } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, key]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!isSidebarOpen || !sidebar) {
      return;
    }
    const focusable = () => [
      ...sidebar.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]'),
    ];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    sidebar.addEventListener('keydown', onKeyDown);
    const toggle = toggleRef.current;
    return () => {
      sidebar.removeEventListener('keydown', onKeyDown);
      toggle?.focus();
    };
  }, [isSidebarOpen]);

  return (
    <>
      <button
        ref={toggleRef}
        data-iden-press=""
        aria-controls="iden-console-navigation"
        aria-expanded={isSidebarOpen}
        aria-label={tUi('open_navigation')}
        className={styles.navToggle}
        type="button"
        onClick={() => {
          setIsSidebarOpen(true);
        }}
      >
        <Menu />
      </button>
      <button
        aria-label={tUi('close_navigation')}
        className={classNames(styles.navOverlay, isSidebarOpen && styles.open)}
        type="button"
        onClick={() => {
          setIsSidebarOpen(false);
        }}
      />
      <div
        ref={sidebarRef}
        id="iden-console-navigation"
        className={classNames(styles.sidebarFrame, isSidebarOpen && styles.open)}
      >
        {children}
      </div>
    </>
  );
}
