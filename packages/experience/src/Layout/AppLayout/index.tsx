import { IdentityOrbit, MotionRuntime, useSurfaceMotion } from '@iden/ui-foundation/react';
import idenAppIcon from '@logto/core-kit/assets/iden-app-icon.svg';
import classNames from 'classnames';
import { useContext, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import usePlatform from '@/hooks/use-platform';
import LogtoSignature from '@/shared/components/LogtoSignature';
import { getBrandingLogoUrl } from '@/shared/utils/logo';
import { isCloudBuild, productBrand } from '@/shared/utils/product-brand';
import { layoutClassNames } from '@/utils/consts';

import CustomContent from './CustomContent';
import styles from './index.module.scss';

const AppLayout = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { isMobile } = usePlatform();
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const hasCustomContent = Boolean(experienceSettings?.customContent[pathname]);
  const showsIdentityPanel = !isCloudBuild && !isMobile && !hasCustomContent;
  const logoUrl = getBrandingLogoUrl({
    theme,
    branding: experienceSettings?.branding ?? {},
    isDarkModeEnabled: experienceSettings?.color.isDarkModeEnabled ?? true,
  });
  const customLogoUrl = logoUrl && logoUrl !== idenAppIcon ? logoUrl : undefined;
  useSurfaceMotion(mainRef, pathname, !isCloudBuild);

  return (
    <div className={styles.viewBox}>
      <MotionRuntime isEnabled={!isCloudBuild} />
      <div
        className={classNames(
          styles.container,
          showsIdentityPanel && styles.split,
          layoutClassNames.pageContainer
        )}
      >
        {!isMobile && <CustomContent className={layoutClassNames.customContent} />}
        {showsIdentityPanel && (
          <aside className={styles.identityPanel} aria-hidden="true">
            <IdentityOrbit
              className={styles.orbit}
              logoUrl={customLogoUrl}
              isMarkVisible={!hideLogtoBranding}
            />
            {!hideLogtoBranding && !customLogoUrl && (
              <div className={styles.identityCaption}>
                <span>{productBrand.productName}</span>
                <p>{productBrand.slogan}</p>
              </div>
            )}
          </aside>
        )}
        <main ref={mainRef} className={classNames(styles.main, layoutClassNames.mainContent)}>
          <Outlet />
          {!hideLogtoBranding && (
            <LogtoSignature
              className={classNames(styles.signature, layoutClassNames.signature)}
              theme={theme}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
