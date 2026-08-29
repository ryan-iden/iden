import react from '@vitejs/plugin-react';
import { mergeConfig, defineConfig, type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

import { defaultConfig } from '../../vite.shared.config';

const buildConfig = (mode: string): UserConfig => ({
  base: '/device-demo-app',
  server: {
    port: 5005,
    hmr: {
      port: 6005,
    },
  },
  plugins: [
    react(),
    viteCompression({ disable: mode === 'development' }),
    viteCompression({ disable: mode === 'development', algorithm: 'brotliCompress' }),
  ],
  define: {
    'process.env': {
      IS_CLOUD: process.env.IS_CLOUD,
    },
  },
});

export default defineConfig(({ mode }) => mergeConfig(defaultConfig, buildConfig(mode)));
