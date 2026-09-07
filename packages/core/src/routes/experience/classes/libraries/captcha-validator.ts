import {
  AliyunCaptchaRegion,
  CaptchaType,
  RecaptchaEnterpriseMode,
  type AliyunCaptchaConfig,
  type CaptchaProvider,
  type RecaptchaEnterpriseConfig,
  type TurnstileConfig,
} from '@logto/schemas';
import ky from 'ky';
import { z } from 'zod';

import { type LogEntry } from '#src/middleware/koa-audit-log.js';

function isRecaptchaEnterprise(
  config: CaptchaProvider['config']
): config is RecaptchaEnterpriseConfig {
  return config.type === CaptchaType.RecaptchaEnterprise;
}

function isTurnstile(config: CaptchaProvider['config']): config is TurnstileConfig {
  return config.type === CaptchaType.Turnstile;
}

function isAliyunCaptcha(config: CaptchaProvider['config']): config is AliyunCaptchaConfig {
  return config.type === CaptchaType.Aliyun;
}

const aliyunCaptchaEndpoints = Object.freeze({
  [AliyunCaptchaRegion.China]: 'captcha.cn-shanghai.aliyuncs.com',
  [AliyunCaptchaRegion.Singapore]: 'captcha.ap-southeast-1.aliyuncs.com',
});

export const getAliyunCaptchaEndpoint = (region: AliyunCaptchaRegion) =>
  aliyunCaptchaEndpoints[region];

type AliyunCaptchaVerificationResult = {
  readonly success: boolean;
  readonly requestId?: string;
  readonly verifyCode?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
};

type AliyunCaptchaVerifier = (
  config: AliyunCaptchaConfig,
  captchaToken: string
) => Promise<AliyunCaptchaVerificationResult>;

const verifyAliyunCaptcha: AliyunCaptchaVerifier = async (config, captchaToken) => {
  const [captchaPackage, openApiPackage] = await Promise.all([
    import('@alicloud/captcha20230305'),
    import('@alicloud/openapi-core'),
  ]);
  // Alibaba Cloud's CommonJS package exposes its generated client through a nested default export.
  const CaptchaClient = captchaPackage.default.default;
  const client = new CaptchaClient(
    new openApiPackage.$OpenApiUtil.Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: getAliyunCaptchaEndpoint(config.region),
      protocol: 'https',
      connectTimeout: 5000,
      readTimeout: 8000,
    })
  );
  const { body } = await client.verifyIntelligentCaptcha(
    new captchaPackage.VerifyIntelligentCaptchaRequest({
      captchaVerifyParam: captchaToken,
      // Always use the server-side scene ID to prevent a client from substituting another scene.
      sceneId: config.sceneId,
    })
  );

  return {
    success: body?.success === true && body.result?.verifyResult === true,
    requestId: body?.requestId,
    verifyCode: body?.result?.verifyCode,
    errorCode: body?.code,
    errorMessage: body?.message,
  };
};

export class CaptchaValidator {
  constructor(
    private readonly captchaProvider: CaptchaProvider,
    private readonly log: LogEntry,
    private readonly aliyunCaptchaVerifier: AliyunCaptchaVerifier = verifyAliyunCaptcha
  ) {}

  public async verifyCaptcha(captchaToken: string): Promise<boolean> {
    const { config } = this.captchaProvider;

    if (isRecaptchaEnterprise(config)) {
      return this.verifyRecaptchaEnterprise(config, captchaToken);
    }

    if (isTurnstile(config)) {
      return this.verifyTurnstile(config, captchaToken);
    }

    if (isAliyunCaptcha(config)) {
      return this.verifyAliyun(config, captchaToken);
    }

    throw new Error('Invalid captcha provider');
  }

  private async verifyAliyun(config: AliyunCaptchaConfig, captchaToken: string) {
    try {
      const result = await this.aliyunCaptchaVerifier(config, captchaToken);

      this.log.append({
        success: result.success,
        requestId: result.requestId,
        verifyCode: result.verifyCode,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });

      return result.success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Alibaba Cloud Captcha',
      });

      return false;
    }
  }

  private async verifyTurnstile(config: TurnstileConfig, captchaToken: string) {
    try {
      const result = await ky
        .post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: config.secretKey,
            response: captchaToken,
          }),
        })
        .json();

      const responseGuard = z.object({
        success: z.boolean(),
        'error-codes': z.array(z.string()).optional(),
      });

      const response = responseGuard.parse(result);

      this.log.append({
        success: response.success,
        errorMessage: response['error-codes']?.join(', '),
      });

      return response.success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Cloudflare Turnstile',
      });

      return false;
    }
  }

  private async verifyRecaptchaEnterprise(config: RecaptchaEnterpriseConfig, captchaToken: string) {
    try {
      const result = await ky
        .post(
          `https://recaptchaenterprise.googleapis.com/v1/projects/${config.projectId}/assessments?key=${config.secretKey}`,
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: {
                token: captchaToken,
                siteKey: config.siteKey,
                // We can't decide the action here, because the interaction event may change after the user interaction.
                // So we use a fixed action here.
                expectedAction: 'interaction',
              },
            }),
          }
        )
        .json();

      const responseGuard = z.object({
        tokenProperties: z.object({
          valid: z.boolean(),
        }),
        riskAnalysis: z.object({
          score: z.number(),
        }),
      });

      const {
        tokenProperties: { valid },
        riskAnalysis: { score },
      } = responseGuard.parse(result);

      // For checkbox mode, only check if the token is valid (skip score threshold)
      // Checkbox challenges are interactive and provide binary pass/fail
      const isCheckboxMode = config.mode === RecaptchaEnterpriseMode.Checkbox;
      // TODO: customize the score threshold
      const success = isCheckboxMode ? valid : valid && score >= 0.5;

      this.log.append({
        success,
        score,
        mode: config.mode ?? RecaptchaEnterpriseMode.Invisible,
      });

      return success;
    } catch {
      this.log.append({
        success: false,
        errorMessage: 'Failed to get the result from Google Recaptcha Enterprise',
      });

      return false;
    }
  }
}
