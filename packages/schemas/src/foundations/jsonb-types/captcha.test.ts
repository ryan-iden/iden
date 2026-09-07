import { describe, expect, it } from 'vitest';

import {
  AliyunCaptchaRegion,
  CaptchaType,
  captchaConfigGuard,
  captchaPublicConfigGuard,
} from './captcha.js';

const aliyunConfig = {
  type: CaptchaType.Aliyun,
  region: AliyunCaptchaRegion.China,
  prefix: 'captcha-prefix',
  sceneId: 'captcha-scene',
  accessKeyId: 'access-key-id',
  accessKeySecret: 'access-key-secret',
};

describe('Alibaba Cloud Captcha config', () => {
  it('accepts complete server-side configuration', () => {
    expect(captchaConfigGuard.parse(aliyunConfig)).toEqual(aliyunConfig);
  });

  it('rejects missing credentials and unsupported regions', () => {
    expect(captchaConfigGuard.safeParse({ ...aliyunConfig, accessKeySecret: '' }).success).toBe(
      false
    );
    expect(captchaConfigGuard.safeParse({ ...aliyunConfig, region: 'us' }).success).toBe(false);
  });

  it('accepts only browser-safe public configuration', () => {
    const {
      accessKeyId: _accessKeyId,
      accessKeySecret: _accessKeySecret,
      ...publicConfig
    } = aliyunConfig;

    expect(captchaPublicConfigGuard.parse(publicConfig)).toEqual(publicConfig);
    expect(captchaPublicConfigGuard.safeParse(aliyunConfig).success).toBe(true);
    expect(captchaPublicConfigGuard.parse(aliyunConfig)).not.toHaveProperty('accessKeySecret');
  });
});
