import { Theme } from '@logto/schemas';

import { getBrandingLogoUrl, resolveSelfHostedBrandingLogoUrl } from './logo';

describe('self-hosted branding logo compatibility', () => {
  it.each(['https://logto.io/logo.svg', 'https://logto.io/logo-dark.svg'])(
    'maps the legacy default %s to the bundled iden icon',
    (legacyLogoUrl) => {
      expect(resolveSelfHostedBrandingLogoUrl(legacyLogoUrl)).not.toBe(legacyLogoUrl);
    }
  );

  it('preserves tenant-provided custom branding', () => {
    const customLogoUrl = 'https://assets.example.com/custom-logo.svg';

    expect(resolveSelfHostedBrandingLogoUrl(customLogoUrl)).toBe(customLogoUrl);
    expect(
      getBrandingLogoUrl({
        theme: Theme.Light,
        branding: { logoUrl: customLogoUrl },
        isDarkModeEnabled: false,
      })
    ).toBe(customLogoUrl);
  });

  it('maps persisted legacy branding selected for dark mode', () => {
    const legacyDarkLogoUrl = 'https://logto.io/logo-dark.svg';

    expect(
      getBrandingLogoUrl({
        theme: Theme.Dark,
        branding: {
          logoUrl: 'https://logto.io/logo.svg',
          darkLogoUrl: legacyDarkLogoUrl,
        },
        isDarkModeEnabled: true,
      })
    ).not.toBe(legacyDarkLogoUrl);
  });
});
