import { useSurfaceMotion } from '@iden/ui-foundation/react';
import { Suspense, useContext } from 'react';
import { useLocation, useOutletContext, useRoutes } from 'react-router-dom';

import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import HostedEmailCapBanner from '@/components/HostedEmailCapBanner';
import { isDevFeaturesEnabled, isIdenBrand } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import Tag from '@/ds-components/Tag';
import { useConsoleRoutes } from '@/hooks/use-console-routes';
import useInterfaceTranslation from '@/hooks/use-interface-translation';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import type { AppContentOutletContext } from '../AppContent/types';

import ResponsiveNavigation from './ResponsiveNavigation';
import Sidebar from './Sidebar';
import useTenantScopeListener from './hooks';
import styles from './index.module.scss';

function ConsoleContent() {
  const { t: tUi } = useInterfaceTranslation();
  const { pathname } = useLocation();
  const { scrollableContent } = useOutletContext<AppContentOutletContext>();
  const { currentTenantId } = useContext(TenantsContext);
  const routeObjects = useConsoleRoutes();
  const routes = useRoutes(routeObjects);
  useSurfaceMotion(scrollableContent, pathname, isIdenBrand);

  usePlausiblePageview(routeObjects, ':tenantId');
  // Use this hook here to make sure console listens to user tenant scope changes.
  useTenantScopeListener();

  return (
    <div className={styles.content}>
      <ResponsiveNavigation>
        <Sidebar />
      </ResponsiveNavigation>
      <OverlayScrollbar className={styles.overlayScrollbarWrapper}>
        <div ref={scrollableContent} className={styles.main}>
          {/* Key by tenant so the banner's per-session dismissal state resets on tenant switch. */}
          <HostedEmailCapBanner key={currentTenantId} />
          <Suspense fallback={<DelayedSuspenseFallback />}>{routes}</Suspense>
        </div>
      </OverlayScrollbar>
      {isDevFeaturesEnabled && (
        <Tag type="state" status="success" variant="plain" className={styles.devStatus}>
          {tUi('development_enabled')}
        </Tag>
      )}
    </div>
  );
}

export default ConsoleContent;
