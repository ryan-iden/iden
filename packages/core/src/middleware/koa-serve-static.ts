// Modified from https://github.com/koajs/static/blob/7f0ed88c8902e441da4e30b42f108617d8dff9ec/index.js

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Context, MiddlewareType } from 'koa';
import send from 'koa-send';

import assertThat from '#src/utils/assert-that.js';

const index = 'index.html';
const indexContentType = 'text/html; charset=utf-8';
export const isIndexPath = (path: string) =>
  ['/', `/${index}`].some((value) => path.endsWith(value));

type StaticOptions = {
  readonly directoryIndex?: boolean;
  readonly notFoundFile?: string;
};

const isMissingFileError = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';

const setStaticResponse = async (ctx: Context, file: string, status?: number) => {
  if (status) {
    ctx.status = status;
  }
  ctx.type = path.extname(file) === '.html' ? indexContentType : path.extname(file);
  ctx.body = await fs.readFile(file);
  ctx.set(
    'Cache-Control',
    path.extname(file) === '.html'
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=604800, immutable'
  );
};

const serveDirectoryPath = async (ctx: Context, root: string, notFoundFile?: string) => {
  const rootPath = path.resolve(root);
  const requestPath = decodeURIComponent(ctx.path).replace(/^\/+/, '');
  const requestedFile = path.resolve(rootPath, requestPath);
  assertThat(
    requestedFile === rootPath || requestedFile.startsWith(rootPath + path.sep),
    new Error('Invalid static asset path.')
  );

  try {
    const stat = await fs.stat(requestedFile);
    const file = stat.isDirectory() ? path.join(requestedFile, index) : requestedFile;
    await setStaticResponse(ctx, file);
  } catch (error: unknown) {
    if (notFoundFile && isMissingFileError(error)) {
      await setStaticResponse(ctx, path.join(rootPath, notFoundFile), 404);
      return;
    }
    throw error;
  }
};

export default function koaServeStatic(
  root: string,
  { directoryIndex = false, notFoundFile }: StaticOptions = {}
) {
  assertThat(root, new Error('Root directory is required to serve files.'));

  const options: send.SendOptions = {
    root: path.resolve(root),
    index,
  };

  const serve: MiddlewareType = async (ctx, next) => {
    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return next();
    }

    if (directoryIndex) {
      await serveDirectoryPath(ctx, root, notFoundFile);
      return;
    }

    // Directly read and set the content of the index file since we need to replace the
    // placeholders in the file with the actual values. It should be OK as the index file is
    // small.
    if (isIndexPath(ctx.path)) {
      const content = await fs.readFile(path.join(root, index), 'utf8');
      ctx.type = indexContentType;
      ctx.body = content;
      ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      await send(ctx, ctx.path, {
        ...options,
        maxage: 604_800_000 /* 7 days */,
      });
    }

    return next();
  };

  return serve;
}
