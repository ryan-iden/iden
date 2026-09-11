import { setImmediate as scheduleImmediate } from 'node:timers';

import { AliyunCaptchaRegion, CaptchaType } from '@logto/schemas';

import { createAliyunCaptcha } from './aliyun-captcha';
import { aliyunCaptchaTriggerId, scriptId } from './constant';

type AliyunOptions = Parameters<NonNullable<Window['initAliyunCaptcha']>>[0];
type AliyunInitialization = ReturnType<NonNullable<Window['initAliyunCaptcha']>>;

const createFixture = (sharedInitializeSdk?: jest.Mock<AliyunInitialization, [AliyunOptions]>) => {
  const element = document.createElement('div');
  const trigger = document.createElement('button');
  element.setAttribute('id', 'aliyun-captcha-element');
  trigger.setAttribute('id', aliyunCaptchaTriggerId);
  document.body.append(element, trigger);

  const instance = { destroy: jest.fn() };
  const initializeSdk =
    sharedInitializeSdk ??
    jest.fn<AliyunInitialization, [AliyunOptions]>((options) => {
      options.getInstance(instance);
    });
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- install the vendor global in this isolated browser test
  Object.defineProperty(window, 'initAliyunCaptcha', {
    configurable: true,
    writable: true,
    value: initializeSdk,
  });

  const captcha = createAliyunCaptcha({
    config: {
      type: CaptchaType.Aliyun,
      region: AliyunCaptchaRegion.China,
      prefix: 'test-prefix',
      sceneId: 'test-scene',
    },
    language: 'en',
    element,
    trigger,
  });

  const options = (index = 0) => {
    const value = initializeSdk.mock.calls[index]?.[0];

    if (!value) {
      throw new Error(`Missing SDK initialization ${index}`);
    }

    return value;
  };

  return { captcha, element, trigger, initializeSdk, instance, options };
};

const flushPromises = async () =>
  new Promise<void>((resolve) => {
    scheduleImmediate(resolve);
  });

describe('Alibaba Cloud Captcha lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.replaceChildren();
    Reflect.deleteProperty(window, 'initAliyunCaptcha');
    Reflect.deleteProperty(window, 'AliyunCaptchaConfig');
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does not initialize against elements removed by a route change', async () => {
    const { captcha, element, trigger, initializeSdk } = createFixture();
    element.remove();
    trigger.remove();

    await expect(captcha.initialize()).rejects.toThrow(Error);
    await expect(captcha.execute()).rejects.toThrow(Error);
    expect(initializeSdk).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('waits for the SDK instance before clicking the mounted trigger', async () => {
    const { captcha, trigger, initializeSdk, instance, options } = createFixture();
    initializeSdk.mockImplementation(jest.fn());
    const click = jest.spyOn(trigger, 'click');
    const execution = captcha.execute();
    await flushPromises();

    expect(click).not.toHaveBeenCalled();
    expect(document.querySelector(options().element)).toBeTruthy();
    expect(document.querySelector(options().button)).toBe(trigger);
    options().getInstance(instance);
    await flushPromises();

    expect(click).toHaveBeenCalledTimes(1);
    options().success('verified-token');
    await expect(execution).resolves.toBe('verified-token');
    expect(jest.getTimerCount()).toBe(0);
    captcha.destroy();
  });

  it('initializes a fresh challenge after a successful verification without reusing the token', async () => {
    const { captcha, initializeSdk, options } = createFixture();
    const first = captcha.execute();
    await flushPromises();
    options().success('first-token');
    await expect(first).resolves.toBe('first-token');

    const second = captcha.execute();
    await flushPromises();

    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(await Promise.race([second, Promise.resolve('pending')])).toBe('pending');
    options(1).success('second-token');
    await expect(second).resolves.toBe('second-token');
    expect(jest.getTimerCount()).toBe(0);
    captcha.destroy();
  });

  it('rejects concurrent verification without canceling the active attempt', async () => {
    const { captcha, trigger, initializeSdk, options } = createFixture();
    const click = jest.spyOn(trigger, 'click');
    const first = captcha.execute();
    await expect(captcha.execute()).rejects.toThrow(Error);
    await flushPromises();

    expect(initializeSdk).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    options().success('active-token');
    await expect(first).resolves.toBe('active-token');
    captcha.destroy();
  });

  it.each(['dismiss', 'network'] as const)(
    'allows verification to retry after a %s failure',
    async (failure) => {
      const { captcha, initializeSdk, options } = createFixture();
      const first = captcha.execute();
      const rejected = expect(first).rejects.toThrow(Error);
      await flushPromises();

      if (failure === 'dismiss') {
        options().onClose('userDismiss');
      } else {
        options().onError(new Error('network unavailable'));
      }

      await rejected;
      const second = captcha.execute();
      await flushPromises();
      expect(initializeSdk).toHaveBeenCalledTimes(2);
      options(1).success('retry-token');
      await expect(second).resolves.toBe('retry-token');
      captcha.destroy();
    }
  );

  it('allows initialization to retry after the SDK reports an error before getInstance', async () => {
    const { captcha, initializeSdk } = createFixture();
    initializeSdk.mockImplementationOnce((configuration) => {
      configuration.onError(new Error('initialization failed'));
    });

    await expect(captcha.initialize()).rejects.toThrow(Error);
    await expect(captcha.initialize()).resolves.toBeUndefined();
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    captcha.destroy();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('cleans up and permits retry after a synchronous SDK initialization exception', async () => {
    const { captcha, initializeSdk } = createFixture();
    initializeSdk.mockImplementationOnce(() => {
      throw new Error('SDK initialization exception');
    });

    await expect(captcha.initialize()).rejects.toThrow(Error);
    await expect(captcha.initialize()).resolves.toBeUndefined();
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    captcha.destroy();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects an asynchronous SDK initialization failure and permits a successful retry', async () => {
    const { captcha, initializeSdk, options } = createFixture();
    initializeSdk.mockImplementationOnce(async () => {
      throw new Error('async SDK initialization failure');
    });

    await expect(captcha.initialize()).rejects.toThrow('async SDK initialization failure');
    expect(jest.getTimerCount()).toBe(0);
    const retry = captcha.execute();
    await flushPromises();

    expect(initializeSdk).toHaveBeenCalledTimes(2);
    options(1).success('retry-after-async-failure');
    await expect(retry).resolves.toBe('retry-after-async-failure');
    captcha.destroy();
  });

  it('does not cancel a replacement session when the old SDK initialization later rejects', async () => {
    const { captcha, initializeSdk, instance, options } = createFixture();
    const rejectInitialization = jest.fn<void, [Error]>();
    const oldInitialization = new Promise<void>((resolve, reject) => {
      rejectInitialization.mockImplementation(reject);
    });
    initializeSdk.mockImplementationOnce(async (configuration) => {
      configuration.getInstance(instance);
      return oldInitialization;
    });

    const first = captcha.execute();
    await flushPromises();
    options().success('first-token');
    await expect(first).resolves.toBe('first-token');

    const second = captcha.execute();
    await flushPromises();
    rejectInitialization(new Error('late old initialization failure'));
    await flushPromises();

    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(await Promise.race([second, Promise.resolve('pending')])).toBe('pending');
    options(1).success('second-token');
    await expect(second).resolves.toBe('second-token');
    captcha.destroy();
  });

  it('hides a vendor popup during cleanup when the SDK exposes no destroy method', async () => {
    const { captcha, initializeSdk } = createFixture();
    const popup = { hide: jest.fn() };
    initializeSdk.mockImplementationOnce((configuration) => {
      configuration.getInstance(popup);
    });
    await captcha.initialize();

    captcha.destroy();
    expect(popup.hide).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('prefers destroying the instance when both destroy and hide are available', async () => {
    const { captcha, initializeSdk } = createFixture();
    const popup = { destroy: jest.fn(), hide: jest.fn() };
    initializeSdk.mockImplementationOnce((configuration) => {
      configuration.getInstance(popup);
    });
    await captcha.initialize();

    captcha.destroy();
    expect(popup.destroy).toHaveBeenCalledTimes(1);
    expect(popup.hide).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('waits for an old route SDK initialization to finish before initializing the replacement route', async () => {
    const oldRoute = createFixture();
    const finishInitialization = jest.fn<void, never[]>();
    const oldInitialization = new Promise<void>((resolve) => {
      finishInitialization.mockImplementation(resolve);
    });
    oldRoute.initializeSdk.mockImplementationOnce(async (configuration) => {
      configuration.getInstance(oldRoute.instance);
      return oldInitialization;
    });
    await oldRoute.captcha.initialize();
    oldRoute.captcha.destroy();
    oldRoute.element.remove();
    oldRoute.trigger.remove();

    const newRoute = createFixture(oldRoute.initializeSdk);
    newRoute.initializeSdk.mockImplementation((configuration) => {
      configuration.getInstance(newRoute.instance);
    });
    const pending = newRoute.captcha.execute();
    await flushPromises();
    expect(newRoute.initializeSdk).toHaveBeenCalledTimes(1);

    finishInitialization();
    await flushPromises();
    expect(newRoute.initializeSdk).toHaveBeenCalledTimes(2);
    newRoute.options(1).success('new-route-token');
    await expect(pending).resolves.toBe('new-route-token');
    newRoute.captcha.destroy();
  });

  it.each(['unmounted', 'timed out'] as const)(
    'never invokes queued SDK initialization after its route has %s',
    async (reason) => {
      const oldRoute = createFixture();
      const finishInitialization = jest.fn<void, never[]>();
      const oldInitialization = new Promise<void>((resolve) => {
        finishInitialization.mockImplementation(resolve);
      });
      oldRoute.initializeSdk.mockImplementationOnce(async (configuration) => {
        configuration.getInstance(oldRoute.instance);
        return oldInitialization;
      });
      await oldRoute.captcha.initialize();
      oldRoute.captcha.destroy();
      oldRoute.element.remove();
      oldRoute.trigger.remove();

      const newRoute = createFixture(oldRoute.initializeSdk);
      newRoute.initializeSdk.mockImplementation((configuration) => {
        configuration.getInstance(newRoute.instance);
      });
      const pending = newRoute.captcha.initialize();
      const rejected = expect(pending).rejects.toThrow(Error);
      await flushPromises();
      expect(newRoute.initializeSdk).toHaveBeenCalledTimes(1);

      if (reason === 'unmounted') {
        newRoute.captcha.destroy();
      } else {
        jest.advanceTimersByTime(120_001);
      }

      await rejected;
      finishInitialization();
      await flushPromises();
      expect(newRoute.initializeSdk).toHaveBeenCalledTimes(1);
      expect(jest.getTimerCount()).toBe(0);
      newRoute.captcha.destroy();
    }
  );

  it('rejects pending initialization when the route unmounts and destroys late SDK instances', async () => {
    const { captcha, initializeSdk, instance, options } = createFixture();
    initializeSdk.mockImplementation(jest.fn());
    const initialization = captcha.initialize();
    const rejected = expect(initialization).rejects.toThrow(Error);
    await flushPromises();

    captcha.destroy();
    await rejected;
    expect(jest.getTimerCount()).toBe(0);
    options().getInstance(instance);
    expect(instance.destroy).toHaveBeenCalled();
    await expect(captcha.execute()).rejects.toThrow(Error);
    expect(initializeSdk).toHaveBeenCalledTimes(1);
  });

  it('rejects pending execution and releases its instance and timers on unmount', async () => {
    const { captcha, instance, options } = createFixture();
    const execution = captcha.execute();
    const rejected = expect(execution).rejects.toThrow(Error);
    await flushPromises();

    captcha.destroy();
    await rejected;
    expect(instance.destroy).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
    options().success('late-token');
    options().onError(new Error('late-error'));
    expect(jest.getTimerCount()).toBe(0);
  });

  it('ignores stale callbacks instead of resolving or canceling a newer attempt', async () => {
    const { captcha, options } = createFixture();
    const first = captcha.execute();
    const rejected = expect(first).rejects.toThrow(Error);
    await flushPromises();
    const stale = options();
    stale.onClose('userDismiss');
    await rejected;

    const second = captcha.execute();
    await flushPromises();
    stale.success('stale-token');
    stale.onError(new Error('stale-error'));
    stale.onClose('userDismiss');
    await flushPromises();
    expect(await Promise.race([second, Promise.resolve('pending')])).toBe('pending');

    options(1).success('current-token');
    await expect(second).resolves.toBe('current-token');
    captcha.destroy();
  });

  it('bounds SDK initialization time so a broken load cannot leave a pending promise forever', async () => {
    const { captcha, initializeSdk } = createFixture();
    initializeSdk.mockImplementation(jest.fn());
    const initialization = captcha.initialize();
    const rejected = expect(initialization).rejects.toThrow(Error);

    jest.advanceTimersByTime(120_001);
    await rejected;
    expect(jest.getTimerCount()).toBe(0);
    captcha.destroy();
  });

  it('bounds verification time and allows a fresh challenge after a timeout', async () => {
    const { captcha, initializeSdk, options } = createFixture();
    const first = captcha.execute();
    const rejected = expect(first).rejects.toThrow(Error);
    await flushPromises();
    jest.advanceTimersByTime(120_001);
    await rejected;

    const second = captcha.execute();
    await flushPromises();
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    options(1).success('after-timeout-token');
    await expect(second).resolves.toBe('after-timeout-token');
    captcha.destroy();
  });

  it('can retry after a failed SDK script load', async () => {
    const { captcha, initializeSdk } = createFixture();
    Reflect.deleteProperty(window, 'initAliyunCaptcha');
    const initialization = captcha.initialize();
    const rejected = expect(initialization).rejects.toThrow(Error);
    await flushPromises();
    const script = document.querySelector(`#${scriptId}`);
    expect(script).not.toBeNull();
    script?.dispatchEvent(new Event('error'));
    await rejected;

    const retry = captcha.initialize();
    await flushPromises();
    const replacementScript = document.querySelector(`#${scriptId}`);
    expect(replacementScript).not.toBeNull();
    expect(replacementScript).not.toBe(script);

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- emulate a successful vendor script load on retry
    Object.defineProperty(window, 'initAliyunCaptcha', {
      configurable: true,
      writable: true,
      value: initializeSdk,
    });
    replacementScript?.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBeUndefined();
    expect(initializeSdk).toHaveBeenCalledTimes(1);
    captcha.destroy();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('removes script listeners on unmount so a late load cannot initialize a detached widget', async () => {
    const { captcha, initializeSdk } = createFixture();
    Reflect.deleteProperty(window, 'initAliyunCaptcha');
    const initialization = captcha.initialize();
    const rejected = expect(initialization).rejects.toThrow(Error);
    await flushPromises();
    const script = document.querySelector(`#${scriptId}`);
    expect(script).not.toBeNull();

    captcha.destroy();
    await rejected;
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- emulate completion of a script request after route unmount
    Object.defineProperty(window, 'initAliyunCaptcha', {
      configurable: true,
      writable: true,
      value: initializeSdk,
    });
    script?.dispatchEvent(new Event('load'));
    script?.dispatchEvent(new Event('error'));
    await flushPromises();

    expect(initializeSdk).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });
});
