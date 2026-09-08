import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', react: 'src/react.tsx' },
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'lib',
  clean: true,
  external: ['react', 'react/jsx-runtime', 'gsap', '@gsap/react'],
});
