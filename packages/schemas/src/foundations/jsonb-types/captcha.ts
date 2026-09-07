import { z } from 'zod';

export enum CaptchaType {
  RecaptchaEnterprise = 'RecaptchaEnterprise',
  Turnstile = 'Turnstile',
  Aliyun = 'Aliyun',
}

export enum AliyunCaptchaRegion {
  China = 'cn',
  Singapore = 'sgp',
}

export enum RecaptchaEnterpriseMode {
  Invisible = 'invisible',
  Checkbox = 'checkbox',
}

export const turnstileConfigGuard = z.object({
  type: z.literal(CaptchaType.Turnstile),
  siteKey: z.string(),
  secretKey: z.string(),
});

export type TurnstileConfig = z.infer<typeof turnstileConfigGuard>;

export const recaptchaEnterpriseConfigGuard = z.object({
  type: z.literal(CaptchaType.RecaptchaEnterprise),
  siteKey: z.string(),
  secretKey: z.string(),
  projectId: z.string(),
  domain: z.string().optional(),
  mode: z.nativeEnum(RecaptchaEnterpriseMode).optional(),
});

export type RecaptchaEnterpriseConfig = z.infer<typeof recaptchaEnterpriseConfigGuard>;

export const aliyunCaptchaConfigGuard = z.object({
  type: z.literal(CaptchaType.Aliyun),
  prefix: z.string().trim().min(1),
  sceneId: z.string().trim().min(1),
  accessKeyId: z.string().trim().min(1),
  accessKeySecret: z.string().trim().min(1),
  region: z.nativeEnum(AliyunCaptchaRegion),
});

export type AliyunCaptchaConfig = z.infer<typeof aliyunCaptchaConfigGuard>;

export const captchaConfigGuard = z.discriminatedUnion('type', [
  turnstileConfigGuard,
  recaptchaEnterpriseConfigGuard,
  aliyunCaptchaConfigGuard,
]);

export type CaptchaConfig = z.infer<typeof captchaConfigGuard>;

export const captchaPublicConfigGuard = z.discriminatedUnion('type', [
  turnstileConfigGuard.pick({ type: true, siteKey: true }),
  recaptchaEnterpriseConfigGuard.pick({
    type: true,
    siteKey: true,
    domain: true,
    mode: true,
  }),
  aliyunCaptchaConfigGuard.pick({
    type: true,
    prefix: true,
    sceneId: true,
    region: true,
  }),
]);

export type CaptchaPublicConfig = z.infer<typeof captchaPublicConfigGuard>;
