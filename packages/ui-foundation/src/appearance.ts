export type SurfaceTheme = 'light' | 'dark';
export type SurfaceAppearance = SurfaceTheme | 'system';
const appearanceKey = 'iden:workspace:appearance';

export const getWorkspaceTheme = (): SurfaceTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const systemTheme =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  try {
    const mode = localStorage.getItem(appearanceKey);
    return mode === 'light' || mode === 'dark' ? mode : systemTheme;
  } catch {
    return systemTheme;
  }
};

export const persistWorkspaceAppearance = (mode: SurfaceAppearance) => {
  try {
    localStorage.setItem(appearanceKey, mode);
    window.dispatchEvent(new Event('iden:appearance-change'));
  } catch {
    // Private or embedded browsing may disable storage; the active document still updates.
  }
};

export const observeWorkspaceAppearance = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === appearanceKey) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('iden:appearance-change', listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('iden:appearance-change', listener);
  };
};

/** Theme messages contain presentation state only, and never authenticate a frame. */
export const synchronizeAppearance = (theme: SurfaceTheme) => {
  Reflect.set(document.documentElement.dataset, 'theme', theme);
  for (const frame of document.querySelectorAll<HTMLIFrameElement>('iframe[data-iden-help]')) {
    frame.contentWindow?.postMessage({ type: 'iden:appearance', theme }, window.location.origin);
  }
};

export const readParentAppearance = (apply: (theme: SurfaceTheme) => void) => {
  const listener = (event: MessageEvent<unknown>) => {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin ||
      !event.data ||
      typeof event.data !== 'object'
    ) {
      return;
    }
    const type: unknown = Reflect.get(event.data, 'type');
    const theme: unknown = Reflect.get(event.data, 'theme');
    if (type === 'iden:appearance' && (theme === 'light' || theme === 'dark')) {
      apply(theme);
    }
  };
  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
  };
};
