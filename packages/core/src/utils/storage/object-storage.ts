import type { StorageProviderData } from '@logto/schemas';

import { streamToBuffer } from '#src/utils/file.js';

import { buildAzureStorage } from './azure-storage.js';
import { buildGoogleStorage } from './google-storage.js';
import { buildLocalStorage } from './local-storage.js';
import { buildS3Storage } from './s3-storage.js';

type StoredObject = {
  data: Uint8Array;
  contentLength: number;
  contentType?: string;
};

type ObjectStorage = {
  uploadFile: (
    data: Uint8Array,
    objectKey: string,
    options?: { contentType?: string }
  ) => Promise<{ url: string }>;
  downloadFile: (objectKey: string) => Promise<StoredObject>;
  isFileExisted: (objectKey: string) => Promise<boolean>;
  deleteFilesByPrefix: (prefix: string) => Promise<void>;
};

export const buildObjectStorage = (config: StorageProviderData): ObjectStorage => {
  if (config.provider === 'LocalStorage') {
    const storage = buildLocalStorage(config.rootPath);

    return {
      ...storage,
      downloadFile: async (objectKey) => {
        const data = await storage.downloadFile(objectKey);
        return { data, contentLength: data.byteLength };
      },
    };
  }

  if (config.provider === 'AzureStorage') {
    const storage = buildAzureStorage(config.connectionString, config.container);

    return {
      uploadFile: storage.uploadFile,
      isFileExisted: storage.isFileExisted,
      deleteFilesByPrefix: storage.deleteFilesByPrefix,
      downloadFile: async (objectKey) => {
        const response = await storage.downloadFile(objectKey);
        const data = await streamToBuffer(response.readableStreamBody);
        return {
          data,
          contentLength: response.contentLength ?? data.byteLength,
          contentType: response.contentType,
        };
      },
    };
  }

  if (config.provider === 'GoogleStorage') {
    const storage = buildGoogleStorage(config.projectId, config.keyFilename, config.bucketName);
    return {
      ...storage,
      uploadFile: async (data, objectKey, options) =>
        storage.uploadFile(Buffer.from(data), objectKey, options),
    };
  }

  return buildS3Storage({
    endpoint: config.endpoint,
    bucket: config.bucket,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.accessSecretKey,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
  });
};
