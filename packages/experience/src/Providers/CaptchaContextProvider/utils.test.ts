import { AliyunCaptchaRegion, CaptchaType, type CaptchaPublicConfig } from '@logto/schemas';

import { getAliyunCaptchaLanguage, getScript } from './utils';

describe('Alibaba Cloud Captcha browser configuration', () => {
  const config: CaptchaPublicConfig = {
    type: CaptchaType.Aliyun,
    region: AliyunCaptchaRegion.China,
    prefix: 'captcha-prefix',
    sceneId: 'captcha-scene',
  };

  it('loads the official Web/H5 client SDK', () => {
    expect(getScript(config)).toBe(
      'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js'
    );
  });

  it.each([
    ['zh-CN', 'cn'],
    ['zh-HK', 'tw'],
    ['zh-TW', 'tw'],
    ['pt-BR', 'pt'],
    ['tr-TR', 'tr'],
    ['ja', 'ja'],
    ['fa-IR', 'en'],
  ])('maps UI locale %s to provider locale %s', (locale, providerLocale) => {
    expect(getAliyunCaptchaLanguage(locale)).toBe(providerLocale);
  });
});
