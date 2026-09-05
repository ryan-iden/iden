import { getBrandingLogoUrl } from '@experience/shared/utils/logo';
import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import LoadingIcon from '@ac/assets/icons/loading-icon.svg?react';
import useInterfaceTranslation from '@ac/hooks/use-interface-translation';

import styles from './index.module.scss';

const GlobalLoading = () => {
  const { t: tUi } = useInterfaceTranslation();
  const { theme, experienceSettings } = useContext(PageContext);

  const logoUrl =
    experienceSettings &&
    getBrandingLogoUrl({
      theme,
      branding: experienceSettings.branding,
      isDarkModeEnabled: experienceSettings.color.isDarkModeEnabled,
    });

  return (
    <div className={styles.container}>
      {logoUrl && <img className={styles.logo} src={logoUrl} alt={tUi('logo')} />}
      <LoadingIcon className={styles.spinner} />
    </div>
  );
};

export default GlobalLoading;
