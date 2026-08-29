/** @fileoverview The common config for frontend projects. */

import { type Plugin, Rollup, UserConfig } from 'vite';

const sanitizeSelfHostedChunk = (code: string) =>
  code
    .replaceAll('Logto Cloud', 'iden')
    .replaceAll('Powered by Logto', 'Powered by iden')
    .replaceAll('docs.logto.io', 'help.iden.local')
    .replaceAll('cloud.logto.io', 'console.iden.local')
    .replaceAll('numbers.logto.io', 'telemetry.iden.local');

const selfHostedBrandSanitizer = (): Plugin => ({
  name: 'self-hosted-brand-sanitizer',
  apply: 'build',
  renderChunk(code) {
    const sanitizedCode = sanitizeSelfHostedChunk(code);
    return sanitizedCode === code ? null : { code: sanitizedCode, map: null };
  },
  generateBundle(_options, bundle) {
    for (const output of Object.values(bundle)) {
      if (output.type === "chunk") {
        output.code = sanitizeSelfHostedChunk(output.code);
      }
    }
  },
});

const isCloudBuild = /^(1|true|yes)$/i.test(process.env.IS_CLOUD ?? '');

export const manualChunks: Rollup.GetManualChunk = (id, { getModuleInfo }) => {
  const hasReactDependency = (id: string): boolean => {
    return (
      getModuleInfo(id)?.importedIds.some(
        (importedId) => importedId.includes('react') || importedId.includes('react-dom')
      ) ?? false
    );
  };

  // Caution: React-related packages should be bundled together otherwise it will cause runtime errors
  if (id.includes('/node_modules/') && hasReactDependency(id)) {
    return 'react';
  }

  if (id.includes('/@logto/')) {
    return '@logto';
  }

  if (id.includes('/node_modules/')) {
    return 'vendors';
  }

  const match = /\/lib\/locales\/([^/]+)/.exec(id);
  if (match?.[1]) {
    return `phrases-${match[1]}`;
  }
};

export const defaultConfig: UserConfig = {
  plugins: isCloudBuild ? [] : [selfHostedBrandSanitizer()],
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: '/src/',
      },
    ],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: { manualChunks },
    },
  },
};
