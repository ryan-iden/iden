import { CaptchaType } from '@logto/schemas';

import { captchaProviders } from './constants';

describe('captchaProviders', () => {
  it('exposes complete Alibaba Cloud Captcha server and browser configuration fields', () => {
    const aliyunProvider = captchaProviders.find(({ type }) => type === CaptchaType.Aliyun);

    expect(aliyunProvider).toBeDefined();
    expect(aliyunProvider?.requiredFields.map(({ field }) => field)).toEqual([
      'region',
      'prefix',
      'sceneId',
      'accessKeyId',
      'accessKeySecret',
    ]);
  });
});
