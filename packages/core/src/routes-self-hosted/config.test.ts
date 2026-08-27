import { EmailServiceProvider, StorageProvider } from '@logto/schemas';

import { maskedSecret, preserveEmailSecret, preserveStorageSecret } from './config.js';

describe('self-hosted instance configuration secrets', () => {
  it('preserves an existing SMTP password when a masked value is submitted', () => {
    const incoming = {
      provider: EmailServiceProvider.Smtp,
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'mailer',
      password: maskedSecret,
      fromName: 'Example',
      fromEmail: 'hello@example.com',
    } as const;
    const current = { ...incoming, password: 'smtp-secret' };

    expect(preserveEmailSecret(incoming, current)).toMatchObject({ password: 'smtp-secret' });
  });

  it('does not carry a secret across email providers', () => {
    const incoming = {
      provider: EmailServiceProvider.SendGrid,
      apiKey: maskedSecret,
      fromName: 'Example',
      fromEmail: 'hello@example.com',
    } as const;
    const current = {
      provider: EmailServiceProvider.Cloudflare,
      apiKey: 'cloudflare-secret',
      accountId: 'account',
      fromName: 'Example',
      fromEmail: 'hello@example.com',
    } as const;

    expect(preserveEmailSecret(incoming, current)).toEqual(incoming);
  });

  it('preserves masked Azure and S3 credentials for the same provider', () => {
    expect(
      preserveStorageSecret(
        {
          provider: StorageProvider.AzureStorage,
          connectionString: maskedSecret,
          container: 'assets',
        },
        {
          provider: StorageProvider.AzureStorage,
          connectionString: 'azure-secret',
          container: 'old-assets',
        }
      )
    ).toMatchObject({ connectionString: 'azure-secret', container: 'assets' });

    expect(
      preserveStorageSecret(
        {
          provider: StorageProvider.S3Storage,
          bucket: 'assets',
          accessKeyId: 'key',
          accessSecretKey: maskedSecret,
        },
        {
          provider: StorageProvider.S3Storage,
          bucket: 'old-assets',
          accessKeyId: 'old-key',
          accessSecretKey: 's3-secret',
        }
      )
    ).toMatchObject({ accessSecretKey: 's3-secret', bucket: 'assets' });
  });
});
