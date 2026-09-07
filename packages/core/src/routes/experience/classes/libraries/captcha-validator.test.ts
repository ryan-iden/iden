import { AliyunCaptchaRegion, CaptchaType, type CaptchaProvider } from '@logto/schemas';

import { type LogEntry } from '#src/middleware/koa-audit-log.js';

import { CaptchaValidator, getAliyunCaptchaEndpoint } from './captcha-validator.js';

const { jest } = import.meta;

const aliyunConfig = {
  type: CaptchaType.Aliyun,
  region: AliyunCaptchaRegion.China,
  prefix: 'captcha-prefix',
  sceneId: 'captcha-scene',
  accessKeyId: 'access-key-id',
  accessKeySecret: 'access-key-secret',
} as const;

const captchaProvider: CaptchaProvider = {
  tenantId: 'default',
  id: 'captcha-provider',
  createdAt: 1,
  updatedAt: 1,
  config: aliyunConfig,
};

const createLog = () => {
  const append = jest.fn();

  return {
    log: { append } as unknown as LogEntry,
    append,
  };
};

describe('CaptchaValidator — Alibaba Cloud Captcha', () => {
  it('maps configured regions to fixed official endpoints', () => {
    expect(getAliyunCaptchaEndpoint(AliyunCaptchaRegion.China)).toBe(
      'captcha.cn-shanghai.aliyuncs.com'
    );
    expect(getAliyunCaptchaEndpoint(AliyunCaptchaRegion.Singapore)).toBe(
      'captcha.ap-southeast-1.aliyuncs.com'
    );
  });

  it('passes the configured scene and opaque client token to the verifier', async () => {
    const { log, append } = createLog();
    const verifier = jest.fn(async () => ({
      success: true,
      requestId: 'request-id',
      verifyCode: 'passed',
    }));
    const validator = new CaptchaValidator(captchaProvider, log, verifier);

    await expect(validator.verifyCaptcha('captcha-verify-param')).resolves.toBe(true);
    expect(verifier).toHaveBeenCalledWith(aliyunConfig, 'captcha-verify-param');
    expect(append).toHaveBeenCalledWith({
      success: true,
      requestId: 'request-id',
      verifyCode: 'passed',
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  it('fails closed without logging credentials when the provider is unavailable', async () => {
    const { log, append } = createLog();
    const verifier = jest.fn(async () => {
      throw new Error('provider unavailable');
    });
    const validator = new CaptchaValidator(captchaProvider, log, verifier);

    await expect(validator.verifyCaptcha('captcha-verify-param')).resolves.toBe(false);
    expect(append).toHaveBeenCalledWith({
      success: false,
      errorMessage: 'Failed to get the result from Alibaba Cloud Captcha',
    });
    expect(JSON.stringify(append.mock.calls)).not.toContain('access-key-secret');
  });
});
