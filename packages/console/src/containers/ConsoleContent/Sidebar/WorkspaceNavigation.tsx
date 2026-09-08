import { useSurfaceMotion } from '@iden/ui-foundation/react';
import classNames from 'classnames';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { brandProfile } from '@/consts/brand';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useInterfaceTranslation from '@/hooks/use-interface-translation';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import Item from './components/Item';
import { useSidebarMenuItems } from './hook';
import { getPath } from './utils';
import styles from './workspace.module.scss';

export default function WorkspaceNavigation() {
  const { sections } = useSidebarMenuItems();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tab_sections' });
  const { t: tUi } = useInterfaceTranslation();
  const { match, getTo } = useTenantPathname();
  const { pathname } = useLocation();
  const { documentationSiteUrl } = useDocumentationUrl();
  const contentRef = useRef<HTMLElement>(null);
  const selected =
    sections.find(({ items }) =>
      items.some(({ path, title }) => match('/' + (path ?? getPath(title))))
    ) ?? sections[0];
  useSurfaceMotion(contentRef, selected?.title ?? pathname, true);

  return (
    <div className={styles.workspace}>
      <nav className={styles.rail} aria-label={tUi('open_navigation')}>
        {sections.map(({ title, items }) => {
          const first = items.find(({ isHidden }) => !isHidden);
          if (!first) {
            return null;
          }
          const { Icon } = first;
          return (
            <Link
              key={title}
              to={getTo('/' + (first.path ?? getPath(first.title)))}
              className={classNames(styles.destination, selected?.title === title && styles.active)}
              aria-current={selected?.title === title ? 'true' : undefined}
            >
              <Icon aria-hidden="true" size={21} strokeWidth={1.6} />
              <span>{t(title)}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.context}>
        <div className={styles.contextHeading}>
          <span className={styles.indicator} aria-hidden="true" />
          {selected && t(selected.title)}
        </div>
        <nav ref={contentRef} className={styles.items} aria-label={selected && t(selected.title)}>
          {selected?.items.map(
            ({ title, Icon, isHidden, modal, externalLink, path }) =>
              !isHidden && (
                <Item
                  key={title}
                  titleKey={title}
                  icon={<Icon />}
                  path={path}
                  isActive={match('/' + (path ?? getPath(title)))}
                  modal={modal}
                  externalLink={externalLink}
                />
              )
          )}
        </nav>
        <footer className={styles.footer}>
          <span className={styles.slogan}>{brandProfile.slogan}</span>
          {!brandProfile.hideOpenSourceNotice && (
            <a href={`${documentationSiteUrl}/about`}>{tUi('about')}</a>
          )}
        </footer>
      </div>
    </div>
  );
}
