import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import Koa from 'koa';
import request from 'supertest';

import koaServeStatic from './koa-serve-static.js';

describe('koaServeStatic directory mode', () => {
  const root = path.join(tmpdir(), `logto-static-test-${process.pid}`);

  beforeEach(async () => {
    await rm(root, { recursive: true, force: true });
    await mkdir(path.join(root, 'en/guide'), { recursive: true });
    await writeFile(path.join(root, 'en/guide/index.html'), '<h1>Guide</h1>');
    await writeFile(path.join(root, '404.html'), '<h1>Missing</h1>');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('serves nested directory indexes', async () => {
    const app = new Koa();
    app.use(koaServeStatic(root, { directoryIndex: true, notFoundFile: '404.html' }));

    const response = await request(app.callback()).get('/en/guide/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Guide');
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('uses the help center 404 document for unknown routes', async () => {
    const app = new Koa();
    app.use(koaServeStatic(root, { directoryIndex: true, notFoundFile: '404.html' }));

    const response = await request(app.callback()).get('/en/missing/');

    expect(response.status).toBe(404);
    expect(response.text).toContain('Missing');
  });
});
