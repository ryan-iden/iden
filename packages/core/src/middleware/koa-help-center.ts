import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';

import { EnvSet } from '#src/env-set/index.js';
import serveStatic from '#src/middleware/koa-serve-static.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

const distributionPath = path.join(
  path.dirname(fileURLToPath(import.meta.resolve('@logto/help-center/package.json'))),
  'dist'
);

/** Serve the independent same-origin help bundle without adding it to a frontend entry chunk. */
export default function koaHelpCenter(): MiddlewareType {
  if (EnvSet.values.isProduction) {
    return serveStatic(distributionPath, {
      directoryIndex: true,
      notFoundFile: '404.html',
    });
  }

  return proxy('*', {
    target: 'http://localhost:5006',
    changeOrigin: true,
    logs: (ctx, target) => {
      if (!path.basename(ctx.request.path).includes('.')) {
        getConsoleLogFromContext(ctx).plain(`\tproxy --> ${target}`);
      }
    },
    rewrite: (requestPath) => `/help${requestPath}`,
  });
}
