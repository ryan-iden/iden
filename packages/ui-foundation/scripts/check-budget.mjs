import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

// Measure the actual browser dependency graph; React belongs to the pre-existing application.
for (const entry of ['src/motion.ts', 'src/react.tsx']) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    external: ['react', 'react/jsx-runtime'],
  });
  const bytes = gzipSync(result.outputFiles[0].contents).byteLength;
  console.log(`${entry}: ${bytes} gzip bytes (limit 61440)`);
  assert.ok(bytes <= 60 * 1024, `${entry} exceeds the initial motion budget`);
}
