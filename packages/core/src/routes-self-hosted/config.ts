import {
  type EmailServiceConfig,
  EmailServiceProvider,
  type StorageProviderData,
  StorageProvider,
} from '@logto/schemas';

export const maskedSecret = '********';

export const preserveEmailSecret = (
  incoming: EmailServiceConfig,
  current?: EmailServiceConfig
): EmailServiceConfig => {
  if (
    incoming.provider === EmailServiceProvider.Smtp &&
    incoming.password === maskedSecret &&
    current?.provider === EmailServiceProvider.Smtp
  ) {
    return { ...incoming, password: current.password };
  }

  if (
    (incoming.provider === EmailServiceProvider.SendGrid ||
      incoming.provider === EmailServiceProvider.Cloudflare) &&
    incoming.apiKey === maskedSecret &&
    current?.provider === incoming.provider
  ) {
    return { ...incoming, apiKey: current.apiKey };
  }

  return incoming;
};

export const preserveStorageSecret = (
  incoming: StorageProviderData,
  current?: StorageProviderData
): StorageProviderData => {
  if (
    incoming.provider === StorageProvider.AzureStorage &&
    incoming.connectionString === maskedSecret &&
    current?.provider === StorageProvider.AzureStorage
  ) {
    return { ...incoming, connectionString: current.connectionString };
  }

  if (
    incoming.provider === StorageProvider.S3Storage &&
    incoming.accessSecretKey === maskedSecret &&
    current?.provider === StorageProvider.S3Storage
  ) {
    return { ...incoming, accessSecretKey: current.accessSecretKey };
  }

  return incoming;
};
