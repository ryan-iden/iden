import { describe, expect, it } from 'vitest';

import {
  idenBrandProfile,
  isCloudBrandEnvironment,
  logtoBrandProfile,
  rebrandProductPhrases,
  rebrandProductText,
  resolveBrandProfile,
  resolveSelfHostedHelpLink,
} from './brand.js';

describe('resolveBrandProfile', () => {
  it('uses iden for self-hosted builds', () => {
    expect(resolveBrandProfile(false)).toBe(idenBrandProfile);
  });

  it('preserves Logto for Cloud builds', () => {
    expect(resolveBrandProfile(true)).toBe(logtoBrandProfile);
  });

  it('does not treat a false environment string as Cloud', () => {
    expect(isCloudBrandEnvironment('true')).toBe(true);
    expect(isCloudBrandEnvironment('1')).toBe(true);
    expect(isCloudBrandEnvironment('false')).toBe(false);
    expect(isCloudBrandEnvironment(null)).toBe(false);
  });
});

describe('rebrandProductText', () => {
  it('rebrands self-hosted product prose', () => {
    expect(rebrandProductText('Welcome to Logto Cloud. Powered by Logto.', false)).toBe(
      'Welcome to iden. Powered by iden.'
    );
  });

  it('preserves compatibility identifiers', () => {
    expect(
      rebrandProductText(
        'Use @logto/react, LogtoClient, urn:logto:scope, and Logto-ID-Token with Logto.',
        false
      )
    ).toBe('Use @logto/react, LogtoClient, urn:logto:scope, and Logto-ID-Token with iden.');
  });

  it('does not alter Cloud phrases', () => {
    expect(rebrandProductPhrases({ title: 'Logto Cloud' }, true)).toEqual({
      title: 'Logto Cloud',
    });
  });
});

describe('resolveSelfHostedHelpLink', () => {
  it('maps inherited product sites to local help without rewriting third-party links', () => {
    expect(resolveSelfHostedHelpLink('https://docs.logto.io/logto-oss#setup', 'zh-CN')).toBe(
      '/help/zh-CN/iden-oss#setup'
    );
    expect(resolveSelfHostedHelpLink('https://cloud.logto.io/to/applications')).toBe(
      '/help/en/introduction/'
    );
    expect(resolveSelfHostedHelpLink('https://help.iden.local/quick-starts', 'en-US')).toBe(
      '/help/en/quick-starts'
    );
    expect(resolveSelfHostedHelpLink('https://developer.mozilla.org/')).toBeUndefined();
  });
});
