import { CaptchaType, RecaptchaEnterpriseMode, Theme } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { useMemo, useContext, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '../PageContextProvider/PageContext';

import CaptchaContext, { type CaptchaContextType } from './CaptchaContext';
import { createAliyunCaptcha } from './aliyun-captcha';
import { scriptId } from './constant';
import { getAliyunCaptchaLanguage, getScript } from './utils';

type Props = {
  readonly children: React.ReactNode;
};

const CaptchaContextProvider = ({ children }: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);
  const widgetRef = useRef<HTMLDivElement>(null);
  const aliyunCaptchaRef = useRef<ReturnType<typeof createAliyunCaptcha>>();
  const { i18n } = useTranslation();

  const captchaPolicy = experienceSettings?.captchaPolicy;
  const captchaConfig = experienceSettings?.captchaConfig;
  const isCaptchaRequired = Boolean(captchaPolicy?.enabled);
  const aliyunLanguage = getAliyunCaptchaLanguage(i18n.resolvedLanguage || i18n.language || 'en');

  const initCaptcha = useCallback(() => {
    // Alibaba Cloud initialization is owned by its mounted CaptchaBox, whose DOM must exist first.
    if (!isCaptchaRequired || !captchaConfig || captchaConfig.type === CaptchaType.Aliyun) {
      return;
    }

    if (document.querySelector(`#${scriptId}`)) {
      return;
    }

    const script = document.createElement('script');
    /* eslint-disable @silverhand/fp/no-mutation -- configure the vendor script before inserting it */
    script.src = getScript(captchaConfig);
    script.id = scriptId;
    script.async = true;
    /* eslint-enable @silverhand/fp/no-mutation */
    document.body.append(script);
  }, [isCaptchaRequired, captchaConfig]);

  const mountAliyunCaptcha = useCallback<NonNullable<CaptchaContextType['mountAliyunCaptcha']>>(
    (element, trigger) => {
      if (!isCaptchaRequired || captchaConfig?.type !== CaptchaType.Aliyun) {
        return noop;
      }

      aliyunCaptchaRef.current?.destroy();
      const captcha = createAliyunCaptcha({
        config: captchaConfig,
        language: aliyunLanguage,
        element,
        trigger,
      });
      // eslint-disable-next-line @silverhand/fp/no-mutation -- retain the controller for the currently mounted host
      aliyunCaptchaRef.current = captcha;
      // Warm up device signals and resources while the form is visible. Submission retries failures.
      const initialize = async () => {
        try {
          await captcha.initialize();
        } catch {
          // A failed warm-up is retried, with a localized error if needed, on form submission.
        }
      };
      void initialize();

      return () => {
        if (aliyunCaptchaRef.current === captcha) {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- detach the route's controller before rejecting pending work
          aliyunCaptchaRef.current = undefined;
        }
        captcha.destroy();
      };
    },
    [isCaptchaRequired, captchaConfig, aliyunLanguage]
  );

  const executeCaptcha = useCallback(async () => {
    if (!isCaptchaRequired || !captchaConfig) {
      return;
    }

    if (captchaConfig.type === CaptchaType.Aliyun) {
      if (!aliyunCaptchaRef.current) {
        throw new Error('Alibaba Cloud Captcha host is not mounted');
      }
      return aliyunCaptchaRef.current.execute();
    }

    if (captchaConfig.type === CaptchaType.Turnstile) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.turnstile || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // eslint-disable-next-line @silverhand/fp/no-mutation -- the vendor render API requires an empty host
        widgetRef.current.innerHTML = '';
        window.turnstile.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            reject(new Error(`Turnstile error: ${errorCode}`));
          },
          size: 'flexible',
        });
      });
    }

    if (!window.grecaptcha?.enterprise) {
      return;
    }

    if (captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.grecaptcha || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // eslint-disable-next-line @silverhand/fp/no-mutation -- the vendor render API requires an empty host
        widgetRef.current.innerHTML = '';
        window.grecaptcha.enterprise.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            reject(new Error(`reCAPTCHA error: ${errorCode}`));
          },
        });
      });
    }

    return window.grecaptcha.enterprise.execute(captchaConfig.siteKey, { action: 'interaction' });
  }, [isCaptchaRequired, captchaConfig, theme]);

  useEffect(() => {
    initCaptcha();
  }, [initCaptcha]);

  const captchaContext = useMemo<CaptchaContextType>(
    () => ({ isCaptchaRequired, executeCaptcha, captchaConfig, widgetRef, mountAliyunCaptcha }),
    [isCaptchaRequired, executeCaptcha, captchaConfig, mountAliyunCaptcha]
  );

  return <CaptchaContext.Provider value={captchaContext}>{children}</CaptchaContext.Provider>;
};

export default CaptchaContextProvider;
