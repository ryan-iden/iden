import { type CaptchaPublicConfig, type CaptchaType } from '@logto/schemas';
import { noop } from '@silverhand/essentials';

import { scriptId } from './constant';
import { getScript } from './utils';

type Instance = Parameters<
  Parameters<NonNullable<Window['initAliyunCaptcha']>>[0]['getInstance']
>[0];

type Session = {
  ready: Promise<void>;
  cancel: (error: Error) => void;
  instance?: Instance;
  completed: boolean;
};

type Attempt = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type Options = {
  config: Extract<CaptchaPublicConfig, { type: CaptchaType.Aliyun }>;
  language: string;
  element: HTMLElement;
  trigger: HTMLButtonElement;
};

type InitializeSdk = NonNullable<Window['initAliyunCaptcha']>;

// The SDK shares options and an initialization lock globally, even across different route hosts.
const initializingSdks = new WeakMap<InitializeSdk, Set<() => void>>();

const initializeSdkSerially = async (
  sdk: InitializeSdk,
  signal: AbortSignal,
  initialize: () => ReturnType<InitializeSdk>
) => {
  /* eslint-disable no-await-in-loop -- the vendor singleton must finish one initialization before accepting another */
  while (!signal.aborted) {
    const pending = initializingSdks.get(sdk);

    if (pending) {
      await new Promise<void>((resolve) => {
        const release = () => {
          pending.delete(release);
          signal.removeEventListener('abort', release);
          resolve();
        };
        pending.add(release);
        signal.addEventListener('abort', release, { once: true });
      });
      continue;
    }

    const waiters = new Set<() => void>();
    initializingSdks.set(sdk, waiters);
    try {
      // Keep this lock until the real SDK promise settles, including after a route is unmounted.
      await initialize();
    } finally {
      initializingSdks.delete(sdk);
      for (const release of waiters) {
        release();
      }
    }
    return;
  }
  /* eslint-enable no-await-in-loop */
};

const destroyInstance = (instance?: Instance) => {
  try {
    if (instance?.destroy) {
      instance.destroy();
    } else {
      // V3 documents hide(), while destroy() is only available in some SDK implementations.
      instance?.hide?.();
    }
  } catch {
    // A vendor cleanup failure must not prevent rejecting a pending submission or allow reuse.
  }
};

/** A vendor instance belongs to one mounted pair of DOM elements, never to a whole SPA session. */
export const createAliyunCaptcha = ({ config, language, element, trigger }: Options) => {
  const state: { session?: Session; attempt?: Attempt; destroyed: boolean } = { destroyed: false };

  /* eslint-disable @silverhand/fp/no-mutation -- this adapter owns the mutable vendor lifecycle and pending callbacks */
  const clearSession = (error: Error) => {
    const { session } = state;
    state.session = undefined;
    session?.cancel(error);
    destroyInstance(session?.instance);
  };

  const rejectAttempt = (error: Error) => {
    const { attempt } = state;
    state.attempt = undefined;
    if (attempt) {
      clearTimeout(attempt.timeout);
      attempt.reject(error);
    }
  };

  const fail = (error: Error) => {
    clearSession(error);
    rejectAttempt(error);
  };

  const initialize = async (): Promise<void> => {
    if (state.destroyed || !element.isConnected || !trigger.isConnected) {
      throw new Error('Alibaba Cloud Captcha host is not mounted');
    }

    if (state.session && !state.session.completed) {
      return state.session.ready;
    }

    // V3 tokens are single-use. A successful verification ends the instance's lifecycle.
    clearSession(new Error('Alibaba Cloud Captcha verification completed'));

    const session: Session = { ready: Promise.resolve(), cancel: noop, completed: false };
    state.session = session;
    session.ready = new Promise<void>((resolve, reject) => {
      const controller = new AbortController();
      const script =
        document.querySelector<HTMLScriptElement>(`#${scriptId}`) ??
        document.createElement('script');

      const cleanup = () => {
        clearTimeout(timeout);
        script.removeEventListener('load', onScriptLoad);
        script.removeEventListener('error', onScriptError);
      };

      session.cancel = (error) => {
        controller.abort();
        cleanup();
        reject(error);
      };

      const onScriptError = () => {
        script.remove();
        fail(new Error('Alibaba Cloud Captcha script failed to load'));
      };

      const timeout = setTimeout(() => {
        if (!window.initAliyunCaptcha) {
          script.remove();
        }
        fail(new Error('Alibaba Cloud Captcha initialization timed out'));
      }, 15_000);

      const start = async () => {
        if (state.session !== session || state.destroyed) {
          return;
        }
        if (!element.isConnected || !trigger.isConnected || !window.initAliyunCaptcha) {
          fail(new Error('Alibaba Cloud Captcha SDK or host is unavailable'));
          return;
        }

        try {
          const sdk = window.initAliyunCaptcha;
          await initializeSdkSerially(sdk, controller.signal, async () => {
            if (state.session !== session || !element.isConnected || !trigger.isConnected) {
              throw new Error('Alibaba Cloud Captcha host is not mounted');
            }
            window.AliyunCaptchaConfig = { region: config.region, prefix: config.prefix };
            return sdk({
              SceneId: config.sceneId,
              mode: 'popup',
              element: `#${element.id}`,
              button: `#${trigger.id}`,
              language,
              success: (token) => {
                if (state.session !== session || session.completed) {
                  return;
                }
                session.completed = true;
                const { attempt } = state;
                state.attempt = undefined;
                if (attempt) {
                  clearTimeout(attempt.timeout);
                  attempt.resolve(token);
                }
              },
              onError: () => {
                if (state.session === session && !session.completed) {
                  fail(new Error('Alibaba Cloud Captcha failed to load'));
                }
              },
              onClose: (reason) => {
                if (state.session === session && !session.completed && reason === 'userDismiss') {
                  fail(new Error('Alibaba Cloud Captcha was closed'));
                }
              },
              getInstance: (instance) => {
                if (state.session !== session || state.destroyed) {
                  destroyInstance(instance);
                  return;
                }
                session.instance = instance;
                cleanup();
                resolve();
              },
            });
          });
        } catch (error: unknown) {
          if (state.session === session) {
            fail(
              error instanceof Error
                ? error
                : new Error('Alibaba Cloud Captcha initialization failed')
            );
          }
        }
      };

      const onScriptLoad = () => {
        void start();
      };

      if (window.initAliyunCaptcha) {
        void start();
        return;
      }

      script.addEventListener('load', onScriptLoad, { once: true });
      script.addEventListener('error', onScriptError, { once: true });
      if (!script.isConnected) {
        window.AliyunCaptchaConfig = { region: config.region, prefix: config.prefix };
        script.id = scriptId;
        script.src = getScript(config);
        script.async = true;
        document.body.append(script);
      }
    });

    return session.ready;
  };

  const execute = async (): Promise<string> => {
    if (state.attempt) {
      throw new Error('Alibaba Cloud Captcha verification is already in progress');
    }

    return new Promise<string>((resolve, reject) => {
      const attempt: Attempt = {
        resolve,
        reject,
        timeout: setTimeout(() => {
          fail(new Error('Alibaba Cloud Captcha verification timed out'));
        }, 120_000),
      };
      state.attempt = attempt;
      const startAttempt = async () => {
        try {
          await initialize();
          if (state.attempt !== attempt) {
            return;
          }
          if (!element.isConnected || !trigger.isConnected) {
            throw new Error('Alibaba Cloud Captcha host is not mounted');
          }
          trigger.click();
        } catch (error: unknown) {
          if (state.attempt === attempt) {
            fail(error instanceof Error ? error : new Error('Alibaba Cloud Captcha failed'));
          }
        }
      };
      void startAttempt();
    });
  };

  return {
    initialize,
    execute,
    destroy: () => {
      state.destroyed = true;
      fail(new Error('Alibaba Cloud Captcha was unmounted'));
    },
  };
  /* eslint-enable @silverhand/fp/no-mutation */
};
