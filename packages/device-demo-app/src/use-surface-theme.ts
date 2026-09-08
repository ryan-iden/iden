import { synchronizeAppearance } from '@iden/ui-foundation';
import { useSurfaceMotion } from '@iden/ui-foundation/react';
import { useEffect, useRef } from 'react';

import { useIsDarkMode } from './Footer';
import { isCloudBuild } from './product-brand';

export const useSurfaceTheme = (state: string) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  useSurfaceMotion(surfaceRef, state, !isCloudBuild);
  const isDarkMode = useIsDarkMode();
  useEffect(() => {
    if (!isCloudBuild) {
      synchronizeAppearance(isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);
  return { isDarkMode, surfaceRef };
};
