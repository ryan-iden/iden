import { type AliyunCaptchaRegion, type RecaptchaEnterpriseMode } from '@logto/schemas';

export type CaptchaFormType = {
  siteKey?: string;
  secretKey?: string;
  projectId?: string;
  domain?: string;
  mode?: RecaptchaEnterpriseMode;
  region?: AliyunCaptchaRegion;
  prefix?: string;
  sceneId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
};
