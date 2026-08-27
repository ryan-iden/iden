import { readFile } from 'node:fs/promises';

import { uploadFileGuard, maxUploadFileSize, adminTenantId } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import pRetry, { AbortError } from 'p-retry';
import { object, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { streamToString } from '#src/utils/file.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { buildObjectStorage } from '#src/utils/storage/object-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../../types.js';

import { validateCustomUiArchive } from './custom-ui-archive.js';

const maxRetryCount = 5;

export default function customUiAssetsRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  router.post(
    '/sign-in-exp/default/custom-ui-assets',
    koaQuotaGuard({ key: 'bringYourUiEnabled', quota }),
    koaGuard({
      files: object({
        file: uploadFileGuard.array().min(1).max(1),
      }),
      response: z.object({
        customUiAssetId: z.string(),
      }),
      status: [200, 400, 500],
    }),
    async (ctx, next) => {
      const { file: bodyFiles } = ctx.guard.files;
      const file = bodyFiles[0];

      assertThat(file, 'guard.invalid_input');
      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(file.mimetype === 'application/zip', 'guard.mime_type_not_allowed');

      const [tenantId] = await getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');
      assertThat(tenantId !== adminTenantId, 'guard.not_allowed_for_admin_tenant');

      const customUiAssetId = generateStandardId(8);
      const objectPrefix = `${tenantId}/${customUiAssetId}`;
      const { experienceBlobsProviderConfig, experienceZipsProviderConfig } = SystemContext.shared;

      try {
        if (EnvSet.values.isSelfHostedParityEnabled) {
          assertThat(experienceBlobsProviderConfig, 'storage.not_configured');
          const storage = buildObjectStorage(experienceBlobsProviderConfig);
          const files = validateCustomUiArchive(await readFile(file.filepath));

          await Promise.all(
            files.map(async ({ data, entryName, contentType }) =>
              storage.uploadFile(data, `${objectPrefix}/${entryName}`, {
                contentType,
              })
            )
          );
        } else {
          assertThat(
            experienceZipsProviderConfig?.provider === 'AzureStorage',
            'storage.not_configured'
          );
          const { uploadFile, downloadFile, isFileExisted } = buildAzureStorage(
            experienceZipsProviderConfig.connectionString,
            experienceZipsProviderConfig.container
          );
          const objectKey = `${objectPrefix}/assets.zip`;
          const errorLogObjectKey = `${objectPrefix}/error.log`;
          await uploadFile(await readFile(file.filepath), objectKey, {
            contentType: file.mimetype,
          });
          await pRetry(
            async (retryTimes) => {
              const [hasZip, hasError] = await Promise.all([
                isFileExisted(objectKey),
                isFileExisted(errorLogObjectKey),
              ]);
              if (hasError) {
                const errorLogBlob = await downloadFile(errorLogObjectKey);
                const errorLog = await streamToString(errorLogBlob.readableStreamBody);
                throw new AbortError(errorLog || 'Unzipping failed.');
              }
              if (!hasZip) {
                return;
              }
              if (retryTimes > maxRetryCount) {
                throw new AbortError('Unzip timeout. Max retry count reached.');
              }
              throw new Error('Unzip in progress...');
            },
            { retries: maxRetryCount }
          );
        }
      } catch (error: unknown) {
        if (EnvSet.values.isSelfHostedParityEnabled && experienceBlobsProviderConfig) {
          await buildObjectStorage(experienceBlobsProviderConfig).deleteFilesByPrefix(
            `${objectPrefix}/`
          );
        }
        getConsoleLogFromContext(ctx).error(error);
        throw new RequestError(
          { code: 'storage.upload_error', status: 500 },
          { details: error instanceof Error ? error.message : String(error) }
        );
      }

      ctx.body = { customUiAssetId };
      return next();
    }
  );
}
