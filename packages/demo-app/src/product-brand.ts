import {
  installSelfHostedHelpNavigation,
  isCloudBrandEnvironment,
  rebrandProductPhrases,
  resolveBrandProfile,
} from '@logto/core-kit';
import idenAppIcon from '@logto/core-kit/assets/iden-app-icon.svg';

export const isCloudBuild = isCloudBrandEnvironment(process.env.IS_CLOUD);
export const productBrand = resolveBrandProfile(isCloudBuild);

export const applyProductBrandToDocument = () => {
  Reflect.set(document.documentElement.dataset, 'productBrand', productBrand.id);
  if (!isCloudBuild) {
    installSelfHostedHelpNavigation();
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (favicon) {
      favicon.setAttribute('href', idenAppIcon);
    }
  }
};

export const getBrandedPhrases = <Value>(value: Value): Value =>
  rebrandProductPhrases(value, isCloudBuild);
