import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled, isIdenBrand } from '@/consts/env';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useMatchTenantPath from '@/hooks/use-tenant-pathname';

import WorkspaceNavigation from './WorkspaceNavigation';
import Item from './components/Item';
import Section from './components/Section';
import { useSidebarMenuItems } from './hook';
import styles from './index.module.scss';
import { getPath } from './utils';

function CloudSidebar() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tab_sections',
  });
  const { sections } = useSidebarMenuItems();
  const { match } = useMatchTenantPath();

  return (
    <div className={styles.sidebar}>
      <OverlayScrollbar className={styles.menu}>
        <div className={styles.menuContent}>
          {sections.map(({ title, items }) => (
            <Section key={title} title={t(title)}>
              {items.map(
                ({ title, Icon, isHidden, modal, externalLink, path }) =>
                  !isHidden && (
                    <Item
                      key={title}
                      titleKey={title}
                      icon={<Icon />}
                      isActive={match('/' + (path ?? getPath(title)))}
                      modal={modal}
                      externalLink={externalLink}
                      path={path}
                    />
                  )
              )}
            </Section>
          ))}
          {isDevFeaturesEnabled && <div aria-hidden className={styles.devStatusSpacer} />}
        </div>
      </OverlayScrollbar>
    </div>
  );
}

export default isIdenBrand ? WorkspaceNavigation : CloudSidebar;

export * from './utils';
