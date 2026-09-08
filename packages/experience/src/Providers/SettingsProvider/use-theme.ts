import { getWorkspaceTheme, observeWorkspaceAppearance } from '@iden/ui-foundation';
import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { isCloudBuild } from '@/shared/utils/product-brand';

const prefersDarkSchemeQuery = '(prefers-color-scheme: dark)';

const getDarkThemeWatchMedia = (): MediaQueryList | undefined => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }

  return window.matchMedia(prefersDarkSchemeQuery);
};

export const getThemeBySystemConfiguration = (): Theme =>
  (isCloudBuild ? getDarkThemeWatchMedia()?.matches : getWorkspaceTheme() === 'dark')
    ? Theme.Dark
    : Theme.Light;

export default function useTheme() {
  const { isPreview, experienceSettings, setTheme } = useContext(PageContext);

  useEffect(() => {
    if (!experienceSettings?.color.isDarkModeEnabled) {
      return;
    }

    const changeTheme = () => {
      setTheme(getThemeBySystemConfiguration());
    };

    changeTheme();

    const darkThemeWatchMedia = getDarkThemeWatchMedia();

    if (!darkThemeWatchMedia) {
      return;
    }

    darkThemeWatchMedia.addEventListener('change', changeTheme);
    const unobserve = isCloudBuild ? undefined : observeWorkspaceAppearance(changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
      unobserve?.();
    };
  }, [experienceSettings, isPreview, setTheme]);
}
