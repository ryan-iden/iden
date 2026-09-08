import { isCloudBuild } from '@experience/shared/utils/product-brand';
import { getWorkspaceTheme, observeWorkspaceAppearance } from '@iden/ui-foundation';
import { Theme } from '@logto/schemas';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');

export const getThemeBySystemPreference = () =>
  (isCloudBuild ? darkThemeWatchMedia.matches : getWorkspaceTheme() === 'dark')
    ? Theme.Dark
    : Theme.Light;

export const subscribeToSystemTheme = (listener: () => void) => {
  darkThemeWatchMedia.addEventListener('change', listener);
  const unobserve = isCloudBuild ? undefined : observeWorkspaceAppearance(listener);

  return () => {
    darkThemeWatchMedia.removeEventListener('change', listener);
    unobserve?.();
  };
};
