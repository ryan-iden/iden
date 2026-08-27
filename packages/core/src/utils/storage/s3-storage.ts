import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { z } from 'zod';

import type { UploadFile } from './types.js';

const getRegionFromEndpoint = (endpoint?: string) => {
  if (!endpoint) {
    return;
  }

  return /s3\.([^.]*)\.amazonaws/.exec(endpoint)?.[1];
};

type BuildS3StorageParameters = {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
};

export const buildS3Storage = ({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
  endpoint,
  forcePathStyle,
}: BuildS3StorageParameters) => {
  if (!region && !endpoint) {
    throw new Error('Either region or endpoint must be provided');
  }

  // Endpoint example: s3.us-west-2.amazonaws.com
  const finalRegion = region ?? getRegionFromEndpoint(endpoint) ?? 'us-east-1';

  const client = new S3Client({
    region: finalRegion,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const uploadFile: UploadFile = async (data, objectKey, { contentType, publicUrl } = {}) => {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await client.send(command);

    if (publicUrl) {
      return { url: `${publicUrl}/${objectKey}` };
    }

    if (endpoint) {
      // Custom endpoint URL construction
      if (forcePathStyle) {
        // Path-style URL: https://endpoint/bucket/key
        return {
          url: `${endpoint}/${bucket}/${objectKey}`,
        };
      }
      // Virtual-hosted style URL: https://bucket.endpoint/key
      return {
        url: `${endpoint.replace(/^(https?:\/\/)/, `$1${bucket}.`)}/${objectKey}`,
      };
    }

    // AWS S3 standard URL construction
    if (forcePathStyle) {
      // Path-style URL: https://s3.region.amazonaws.com/bucket/key
      return {
        url: `https://s3.${finalRegion}.amazonaws.com/${bucket}/${objectKey}`,
      };
    }
    // Virtual-hosted style URL: https://bucket.s3.region.amazonaws.com/key
    return {
      url: `https://${bucket}.s3.${finalRegion}.amazonaws.com/${objectKey}`,
    };
  };

  const downloadFile = async (objectKey: string) => {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
    const data = Buffer.from((await result.Body?.transformToByteArray()) ?? []);

    return {
      data,
      contentLength: result.ContentLength ?? data.byteLength,
      contentType: result.ContentType,
    };
  };

  const isFileExisted = async (objectKey: string) => {
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
      return true;
    } catch (error: unknown) {
      const status = z
        .object({ $metadata: z.object({ httpStatusCode: z.number().optional() }) })
        .safeParse(error).data?.$metadata.httpStatusCode;
      if (status === 404) {
        return false;
      }

      throw error;
    }
  };

  const deleteFilesByPrefix = async (prefix: string) => {
    const deletePage = async (continuationToken?: string): Promise<void> => {
      const page = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );
      const objects = page.Contents?.flatMap(({ Key }) => (Key ? [{ Key }] : [])) ?? [];
      if (objects.length > 0) {
        await client.send(
          new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } })
        );
      }
      if (page.NextContinuationToken) {
        await deletePage(page.NextContinuationToken);
      }
    };

    await deletePage();
  };

  return { uploadFile, downloadFile, isFileExisted, deleteFilesByPrefix };
};
