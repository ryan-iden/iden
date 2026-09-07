import { CaptchaType, RecaptchaEnterpriseMode, Theme } from '@logto/schemas';
import { useMemo, useContext, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import useToast from '@/hooks/use-toast';

import PageContext from '../PageContextProvider/PageContext';

import CaptchaContext, { type CaptchaContextType } from './CaptchaContext';
import { aliyunCaptchaTriggerId, scriptId } from './constant';
import { getAliyunCaptchaLanguage, getScript } from './utils';

type Props = {
  readonly children: React.ReactNode;
};

const CaptchaContextProvider = ({ children }: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);
  const widgetRef = useRef<HTMLDivElement>(null);
  const aliyunCaptchaInitializationRef = useRef<Promise<void>>();
  const aliyunCaptchaInstanceRef = useRef<{ destroy?: () => void }>();
  const aliyunCaptchaAttemptRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  const { setToast } = useToast();
  const { t, i18n } = useTranslation();

  const captchaPolicy = experienceSettings?.captchaPolicy;
  const captchaConfig = experienceSettings?.captchaConfig;

  const isCaptchaRequired = Boolean(captchaPolicy?.enabled);

  const initCaptcha = useCallback(() => {
    if (!isCaptchaRequired || !captchaConfig) {
      return;
    }

    if (captchaConfig.type === CaptchaType.Aliyun) {
      // Alibaba Cloud's loader reads this global value while initializing.
      // eslint-disable-next-line @silverhand/fp/no-mutation -- required by the vendor SDK contract
      window.AliyunCaptchaConfig = {
        region: captchaConfig.region,
        prefix: captchaConfig.prefix,
      };
    }

    if (document.querySelector(`#${scriptId}`)) {
      return;
    }

    const script = document.createElement('script');
    /* eslint-disable @silverhand/fp/no-mutation */
    script.src = getScript(captchaConfig);
    script.id = scriptId;
    script.async = true;
    /* eslint-enable @silverhand/fp/no-mutation */

    document.body.append(script);
  }, [isCaptchaRequired, captchaConfig]);

  const rejectAliyunCaptchaAttempt = useCallback((error: Error) => {
    const attempt = aliyunCaptchaAttemptRef.current;

    if (!attempt) {
      return;
    }

    clearTimeout(attempt.timeout);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- this ref tracks the active vendor callback
    aliyunCaptchaAttemptRef.current = undefined;
    attempt.reject(error);
  }, []);

  const initializeAliyunCaptcha = useCallback(async () => {
    if (!captchaConfig || captchaConfig.type !== CaptchaType.Aliyun) {
      throw new Error('Alibaba Cloud Captcha config is not found');
    }

    if (aliyunCaptchaInitializationRef.current) {
      return aliyunCaptchaInitializationRef.current;
    }

    const initialization = new Promise<void>((resolve, reject) => {
      const initialize = () => {
        if (!window.initAliyunCaptcha) {
          reject(new Error('Alibaba Cloud Captcha SDK is unavailable'));
          return;
        }

        window.initAliyunCaptcha({
          SceneId: captchaConfig.sceneId,
          mode: 'popup',
          element: '#aliyun-captcha-element',
          button: `#${aliyunCaptchaTriggerId}`,
          language: getAliyunCaptchaLanguage(i18n.resolvedLanguage),
          success: (captchaVerifyParam) => {
            const attempt = aliyunCaptchaAttemptRef.current;

            if (!attempt) {
              return;
            }

            clearTimeout(attempt.timeout);
            // eslint-disable-next-line @silverhand/fp/no-mutation -- this ref tracks the active vendor callback
            aliyunCaptchaAttemptRef.current = undefined;
            attempt.resolve(captchaVerifyParam);
          },
          onError: () => {
            rejectAliyunCaptchaAttempt(new Error('Alibaba Cloud Captcha failed to load'));
          },
          onClose: (reason) => {
            if (reason === 'userDismiss') {
              rejectAliyunCaptchaAttempt(new Error('Alibaba Cloud Captcha was closed'));
            }
          },
          getInstance: (instance) => {
            // eslint-disable-next-line @silverhand/fp/no-mutation -- retain the vendor instance for cleanup
            aliyunCaptchaInstanceRef.current = instance;
            resolve();
          },
        });
      };

      const script = document.querySelector<HTMLScriptElement>(`#${scriptId}`);

      if (window.initAliyunCaptcha) {
        initialize();
        return;
      }

      if (!script) {
        reject(new Error('Alibaba Cloud Captcha script is not found'));
        return;
      }

      script.addEventListener('load', initialize, { once: true });
      script.addEventListener(
        'error',
        () => {
          reject(new Error('Alibaba Cloud Captcha script failed to load'));
        },
        { once: true }
      );
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation -- cache one initialization per mounted provider
    aliyunCaptchaInitializationRef.current = initialization;

    try {
      await initialization;
    } catch (error: unknown) {
      // Permit a later retry after a transient script or initialization failure.
      // eslint-disable-next-line @silverhand/fp/no-mutation -- reset a rejected initialization cache
      aliyunCaptchaInitializationRef.current = undefined;
      throw error;
    }
  }, [captchaConfig, i18n.resolvedLanguage, rejectAliyunCaptchaAttempt]);

  const executeCaptcha = useCallback(async () => {
    if (!isCaptchaRequired || !captchaConfig) {
      return;
    }

    if (captchaConfig.type === CaptchaType.Aliyun) {
      try {
        await initializeAliyunCaptcha();
      } catch (error: unknown) {
        setToast(t('error.captcha_verification_failed'));
        throw error;
      }

      return new Promise<string>((resolve, reject) => {
        const trigger = document.querySelector<HTMLButtonElement>(`#${aliyunCaptchaTriggerId}`);

        if (!trigger) {
          reject(new Error('Alibaba Cloud Captcha trigger is not found'));
          return;
        }

        if (aliyunCaptchaAttemptRef.current) {
          reject(new Error('Alibaba Cloud Captcha verification is already in progress'));
          return;
        }

        const timeout = setTimeout(() => {
          setToast(t('error.captcha_verification_failed'));
          rejectAliyunCaptchaAttempt(new Error('Alibaba Cloud Captcha verification timed out'));
        }, 120_000);

        // eslint-disable-next-line @silverhand/fp/no-mutation -- bridge the vendor callback to this promise
        aliyunCaptchaAttemptRef.current = { resolve, reject, timeout };
        trigger.click();
      });
    }

    if (captchaConfig.type === CaptchaType.Turnstile) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.turnstile || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // Clear the dom element first
        // eslint-disable-next-line @silverhand/fp/no-mutation
        widgetRef.current.innerHTML = '';

        window.turnstile.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            setToast(t('error.captcha_verification_failed'));
            reject(new Error(`Turnstile error: ${errorCode}`));
          },
          size: 'flexible',
        });
      });
    }

    if (!window.grecaptcha?.enterprise) {
      return;
    }

    // Handle checkbox mode for reCAPTCHA Enterprise
    if (captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.grecaptcha || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // Clear the dom element first
        // eslint-disable-next-line @silverhand/fp/no-mutation
        widgetRef.current.innerHTML = '';

        window.grecaptcha.enterprise.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            setToast(t('error.captcha_verification_failed'));
            reject(new Error(`reCAPTCHA error: ${errorCode}`));
          },
        });
      });
    }

    // Default invisible mode
    return window.grecaptcha.enterprise.execute(captchaConfig.siteKey, {
      action: 'interaction',
    });
  }, [
    isCaptchaRequired,
    captchaConfig,
    initializeAliyunCaptcha,
    rejectAliyunCaptchaAttempt,
    theme,
    setToast,
    t,
  ]);

  useEffect(() => {
    initCaptcha();
  }, [initCaptcha]);

  useEffect(() => {
    if (isCaptchaRequired && captchaConfig?.type === CaptchaType.Aliyun) {
      // Initialize as soon as possible so device signals and challenge resources are ready before
      // the user submits, as recommended by Alibaba Cloud's Web/H5 integration guide.
      const initialize = async () => {
        try {
          await initializeAliyunCaptcha();
        } catch {
          // A transient initialization failure is retried when the user submits the form.
        }
      };

      void initialize();
    }
  }, [captchaConfig, initializeAliyunCaptcha, isCaptchaRequired]);

  useEffect(
    () => () => {
      const attempt = aliyunCaptchaAttemptRef.current;

      if (attempt) {
        clearTimeout(attempt.timeout);
        attempt.reject(new Error('Alibaba Cloud Captcha was unmounted'));
      }

      aliyunCaptchaInstanceRef.current?.destroy?.();
    },
    []
  );

  const captchaContext = useMemo<CaptchaContextType>(
    () => ({
      isCaptchaRequired,
      executeCaptcha,
      captchaConfig,
      widgetRef,
    }),
    [isCaptchaRequired, executeCaptcha, captchaConfig, widgetRef]
  );

  return <CaptchaContext.Provider value={captchaContext}>{children}</CaptchaContext.Provider>;
};

export default CaptchaContextProvider;
