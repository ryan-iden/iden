import { CaptchaType, RecaptchaEnterpriseMode } from '@logto/schemas';

import { type SignInExperienceResponse } from '@/types';

export const getScript = (config: SignInExperienceResponse['captchaConfig']) => {
  // Not supposed to happen
  if (!config) {
    throw new Error('Captcha config is not found');
  }

  if (config.type === CaptchaType.Turnstile) {
    return `https://challenges.cloudflare.com/turnstile/v0/api.js`;
  }

  if (config.type === CaptchaType.Aliyun) {
    return 'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js';
  }

  const domain = config.domain ?? 'www.google.com';

  // For checkbox mode, use explicit render to manually render the widget
  if (config.mode === RecaptchaEnterpriseMode.Checkbox) {
    return `https://${domain}/recaptcha/enterprise.js?render=explicit`;
  }

  // For invisible mode (default), render with siteKey for automatic execution
  return `https://${domain}/recaptcha/enterprise.js?render=${config.siteKey}`;
};

const aliyunCaptchaLanguages = new Set([
  'ar',
  'de',
  'en',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'ru',
  'th',
  'tr',
]);

export const getAliyunCaptchaLanguage = (language: string) => {
  const normalizedLanguage = language.toLowerCase();

  if (normalizedLanguage === 'zh-cn') {
    return 'cn';
  }

  if (normalizedLanguage === 'zh-hk' || normalizedLanguage === 'zh-tw') {
    return 'tw';
  }

  if (normalizedLanguage.startsWith('pt-')) {
    return 'pt';
  }

  if (normalizedLanguage.startsWith('tr-')) {
    return 'tr';
  }

  const baseLanguage = normalizedLanguage.split('-')[0] ?? 'en';

  return aliyunCaptchaLanguages.has(baseLanguage) ? baseLanguage : 'en';
};
