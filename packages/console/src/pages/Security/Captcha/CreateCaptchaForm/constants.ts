import { CaptchaType } from '@logto/schemas';

import aliyunCaptcha from '@/assets/images/aliyun-captcha.svg?react';
import recaptchaEnterprise from '@/assets/images/recaptcha.svg?react';
import turnstile from '@/assets/images/turnstile.svg?react';

import { type CaptchaProviderMetadata } from './types';

const enableCaptchaReadme = `
## Enable CAPTCHA

Remember to enable CAPTCHA bot protection after you have set up the CAPTCHA provider.

Go to the Security page, find the CAPTCHA tab, and switch on the toggle button of "Enable CAPTCHA".
`;

const turnstileReadme = `
# Cloudflare Turnstile

Turnstile is a CAPTCHA service that helps protect your website from spam and abuse. This guide will walk you through the process of setting up Turnstile with Logto.

## Prerequisites

- A Cloudflare account

## Setup

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/login) and select your account.
2. Navigate to **Turnstile** > **Add widget**.
3. Fill out the form with the following details:
   - **Widget name**: Any name you want to give to the widget
   - **Hostname**: Logto's endpoint domain, e.g. https://[tenant-id].logto.app
   - **Widget Mode**: You can leave as default, or choose the one suits you best

## Get the site key and secret key

1. Navigate to a widget you just created, and click **Manage widget**.
2. Scroll down to the bottom and copy the **Site key** and **Secret key**.

${enableCaptchaReadme}
`;

const reCAPTCHAEnterpriseReadme = `
# reCAPTCHA Enterprise

reCAPTCHA Enterprise is a Google service that protects websites from fraud and abuse using advanced bot detection without disrupting user experience. This guide will walk you through the process of setting up reCAPTCHA Enterprise with Logto.

## Prerequisites

- A Google Cloud project

## Setup a reCAPTCHA key

1. Go to the [reCAPTCHA page of Google Cloud Console](https://console.cloud.google.com/security/recaptcha).
2. Click **Create key** button near "reCAPTCHA keys".
3. Fill out the form with the following details:
   - **Display name**: Any name you want to give to the key
   - **Application type**: Website
   - **Domain list**: Add Logto's endpoint domain
4. After creating the key, you will be redirected to the key details page, copy the **ID**.

## Setup an API key

1. Go to the [Credentials page of Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Click **Create credentials** button and select **API key**.
3. Copy the API key.
4. Optionally, you can restrict the API key to **reCAPTCHA Enterprise API** to make it more secure.
5. Remember to leave "Application restrictions" to **None** if you don't understand what it is.

## Get project ID

1. Copy the **Project ID** from the [home page of Google Cloud Console](https://console.cloud.google.com/welcome).

${enableCaptchaReadme}
`;

const aliyunCaptchaReadme = `
# Alibaba Cloud Captcha 2.0

Alibaba Cloud Captcha 2.0 provides risk-based bot detection for Web and H5 applications. iden uses the current Web/H5 client SDK and verifies every successful challenge again on the server.

## Prerequisites

- An Alibaba Cloud account with Captcha 2.0 enabled
- A Web/H5 CAPTCHA scene
- A RAM user with the minimum permissions required to call the CAPTCHA verification API

## Setup

1. Open the [Alibaba Cloud Captcha 2.0 console](https://yundun.console.aliyun.com/?p=captcha2) and create a Web/H5 scene.
2. Copy the **Prefix** and **Scene ID** from the integration information.
3. Create a dedicated RAM user. Do not use the root account AccessKey.
4. Grant the RAM user permission to verify CAPTCHA requests and create an AccessKey pair.
5. Select the service region that matches your CAPTCHA instance:
   - **Chinese mainland** uses the Shanghai API endpoint.
   - **International** uses the Singapore API endpoint.
6. Enter the AccessKey ID and AccessKey secret below. These credentials are never included in the public sign-in experience configuration.

[Web/H5 integration guide](https://help.aliyun.com/zh/captcha/captcha2-0/user-guide/new-architecture-for-web-and-h5-client-access)

[Server integration guide](https://help.aliyun.com/zh/captcha/captcha2-0/user-guide/server-access)

${enableCaptchaReadme}
`;

export const captchaProviders: CaptchaProviderMetadata[] = [
  {
    name: 'security.captcha_providers.recaptcha_enterprise.name',
    type: CaptchaType.RecaptchaEnterprise,
    logo: recaptchaEnterprise,
    logoDark: recaptchaEnterprise,
    description: 'security.captcha_providers.recaptcha_enterprise.description',
    readme: reCAPTCHAEnterpriseReadme,
    requiredFields: [
      {
        field: 'mode',
        label: 'security.captcha_details.mode',
        placeholder: 'security.captcha_details.mode',
      },
      {
        field: 'siteKey',
        label: 'security.captcha_details.recaptcha_key_id',
        placeholder: 'security.captcha_details.recaptcha_key_id',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.recaptcha_api_key',
        placeholder: 'security.captcha_details.recaptcha_api_key',
      },
      {
        field: 'projectId',
        label: 'security.captcha_details.project_id',
        placeholder: 'security.captcha_details.project_id',
      },
      {
        field: 'domain',
        label: 'security.captcha_details.domain',
        placeholder: 'security.captcha_details.domain_placeholder',
        isOptional: true,
      },
    ],
  },
  {
    name: 'security.captcha_providers.turnstile.name',
    type: CaptchaType.Turnstile,
    logo: turnstile,
    logoDark: turnstile,
    description: 'security.captcha_providers.turnstile.description',
    readme: turnstileReadme,
    requiredFields: [
      {
        field: 'siteKey',
        label: 'security.captcha_details.site_key',
        placeholder: 'security.captcha_details.site_key',
      },
      {
        field: 'secretKey',
        label: 'security.captcha_details.secret_key',
        placeholder: 'security.captcha_details.secret_key',
      },
    ],
  },
  {
    name: 'security.captcha_providers.aliyun.name',
    type: CaptchaType.Aliyun,
    logo: aliyunCaptcha,
    logoDark: aliyunCaptcha,
    description: 'security.captcha_providers.aliyun.description',
    readme: aliyunCaptchaReadme,
    requiredFields: [
      {
        field: 'region',
        label: 'security.captcha_details.aliyun_region',
        placeholder: 'security.captcha_details.aliyun_region',
      },
      {
        field: 'prefix',
        label: 'security.captcha_details.aliyun_prefix',
        placeholder: 'security.captcha_details.aliyun_prefix',
      },
      {
        field: 'sceneId',
        label: 'security.captcha_details.aliyun_scene_id',
        placeholder: 'security.captcha_details.aliyun_scene_id',
      },
      {
        field: 'accessKeyId',
        label: 'security.captcha_details.aliyun_access_key_id',
        placeholder: 'security.captcha_details.aliyun_access_key_id',
      },
      {
        field: 'accessKeySecret',
        label: 'security.captcha_details.aliyun_access_key_secret',
        placeholder: 'security.captcha_details.aliyun_access_key_secret',
      },
    ],
  },
];
