import { isFileAssetPath, parseRange } from '@logto/core-kit';
import { tryThat } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import {
  buildAzureStorage,
  isTransientAzureStorageError,
} from '#src/utils/storage/azure-storage.js';
import { buildObjectStorage } from '#src/utils/storage/object-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

const noCache = 'no-cache, no-store, must-revalidate';
const maxAgeSevenDays = 'max-age=604_800_000';

const buildStorageDownloadError = (error: unknown) =>
  new RequestError(
    { code: 'storage.download_error', status: 502 },
    { details: error instanceof Error ? error.message : String(error) }
  );

const serveAzureStorage =
  (
    connectionString: string,
    container: string,
    fileObjectKey: string,
    isFileAssetRequest: boolean
  ): MiddlewareType =>
  async (ctx, next) => {
    const { downloadFile, isFileExisted, getFileProperties } = buildAzureStorage(
      connectionString,
      container
    );
    try {
      const isExisted = await isFileExisted(fileObjectKey, { throwOnTransientError: true });
      assertThat(isExisted, 'entity.not_found', 404);
      const range = ctx.get('range');
      const { start, end, count } = tryThat(
        () => parseRange(range),
        new RequestError({ code: 'request.range_not_satisfiable', status: 416 })
      );
      const downloadFilePromise = downloadFile(fileObjectKey, start, count);
      const filePropertiesPromise = range ? getFileProperties(fileObjectKey) : undefined;
      const { contentLength = 0, readableStreamBody, contentType } = await downloadFilePromise;
      ctx.body = readableStreamBody;
      ctx.type = contentType ?? 'application/octet-stream';
      ctx.status = range ? 206 : 200;
      ctx.set('Cache-Control', isFileAssetRequest ? maxAgeSevenDays : noCache);
      ctx.set('Content-Length', contentLength.toString());
      if (filePropertiesPromise) {
        const { contentLength: totalFileSize = 0 } = await filePropertiesPromise;
        ctx.set('Accept-Ranges', 'bytes');
        ctx.set(
          'Content-Range',
          `bytes ${start ?? 0}-${end ?? Math.max(totalFileSize - 1, 0)}/${totalFileSize}`
        );
      }
    } catch (error: unknown) {
      if (isTransientAzureStorageError(error)) {
        throw buildStorageDownloadError(error);
      }
      throw error;
    }
    return next();
  };

/** Serve tenant custom sign-in assets with SPA fallback and HTTP range support. */
export default function koaServeCustomUiAssets(customUiAssetId: string) {
  const { experienceBlobsProviderConfig } = SystemContext.shared;
  assertThat(experienceBlobsProviderConfig, 'storage.not_configured');

  const serve: MiddlewareType = async (ctx, next) => {
    const [tenantId] = await getTenantId(ctx.URL);
    assertThat(tenantId, 'session.not_found', 404);

    const requestPath = ctx.request.path;
    const isFileAssetRequest = isFileAssetPath(requestPath);
    const contextPath = `${tenantId}/${customUiAssetId}`;
    const fileObjectKey = `${contextPath}${isFileAssetRequest ? requestPath : '/index.html'}`;

    if (experienceBlobsProviderConfig.provider === 'AzureStorage') {
      return serveAzureStorage(
        experienceBlobsProviderConfig.connectionString,
        experienceBlobsProviderConfig.container,
        fileObjectKey,
        isFileAssetRequest
      )(ctx, next);
    }

    const storage = buildObjectStorage(experienceBlobsProviderConfig);
    const isExisted = await storage.isFileExisted(fileObjectKey);
    assertThat(isExisted, 'entity.not_found', 404);

    const {
      data,
      contentLength: totalFileSize,
      contentType,
    } = await storage.downloadFile(fileObjectKey);
    const range = ctx.get('range');
    const { start, end } = tryThat(
      () => parseRange(range),
      new RequestError({ code: 'request.range_not_satisfiable', status: 416 })
    );
    const rangeStart = start ?? 0;
    const rangeEnd = Math.min(end ?? totalFileSize - 1, totalFileSize - 1);
    const responseBody = range ? data.subarray(rangeStart, rangeEnd + 1) : data;

    ctx.body = responseBody;
    ctx.type = contentType ?? fileObjectKey;
    ctx.status = range ? 206 : 200;
    ctx.set('Cache-Control', isFileAssetRequest ? maxAgeSevenDays : noCache);
    ctx.set('Content-Length', responseBody.byteLength.toString());

    if (range) {
      ctx.set('Accept-Ranges', 'bytes');
      ctx.set('Content-Range', `bytes ${rangeStart}-${rangeEnd}/${totalFileSize}`);
    }

    return next();
  };

  return serve;
}
