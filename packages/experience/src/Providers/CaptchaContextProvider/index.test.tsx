import { AliyunCaptchaRegion, CaptchaType } from '@logto/schemas';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode, useContext, useEffect, useMemo } from 'react';
import type * as ReactI18next from 'react-i18next';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import CaptchaBox from '@/containers/CaptchaBox';
import { type SignInExperienceResponse } from '@/types';

import CaptchaContextProvider from '.';
import CaptchaContext, { type CaptchaContextType } from './CaptchaContext';
import { aliyunCaptchaElementId, aliyunCaptchaTriggerId, scriptId } from './constant';

type AliyunOptions = Parameters<NonNullable<Window['initAliyunCaptcha']>>[0];

const mockUseTranslation = jest.fn(() => ({
  i18n: { language: 'en', resolvedLanguage: 'en' },
}));

jest.mock('react-i18next', () => ({
  ...jest.requireActual<typeof ReactI18next>('react-i18next'),
  useTranslation: () => mockUseTranslation(),
}));

const settings: SignInExperienceResponse = {
  ...mockSignInExperienceSettings,
  captchaPolicy: { enabled: true },
  captchaConfig: {
    type: CaptchaType.Aliyun,
    region: AliyunCaptchaRegion.China,
    prefix: 'test-prefix',
    sceneId: 'test-scene',
  },
};

const captureContext = jest.fn<void, [CaptchaContextType]>();

const ContextProbe = () => {
  const context = useContext(CaptchaContext);
  useEffect(() => {
    captureContext(context);
  }, [context]);
  return null;
};

const getContext = () => {
  const context = captureContext.mock.calls.at(-1)?.[0];
  if (!context) {
    throw new Error('Captcha context has not mounted');
  }
  return context;
};

const TestApp = ({
  initialPath = '/form',
  experienceSettings = settings,
}: {
  readonly initialPath?: string;
  readonly experienceSettings?: SignInExperienceResponse;
}) => {
  const pageContext = useContext(PageContext);
  const context = useMemo(
    () => ({ ...pageContext, experienceSettings }),
    [pageContext, experienceSettings]
  );

  return (
    <PageContext.Provider value={context}>
      <CaptchaContextProvider>
        <ContextProbe />
        <MemoryRouter initialEntries={[initialPath]}>
          <Link to="/form">Registration</Link>
          <Link to="/continue">Complete profile</Link>
          <Routes>
            <Route path="/form" element={<CaptchaBox />} />
            <Route path="/continue" element={<div>Profile fields</div>} />
          </Routes>
        </MemoryRouter>
      </CaptchaContextProvider>
    </PageContext.Provider>
  );
};

describe('Alibaba Cloud Captcha route ownership', () => {
  const instance = { destroy: jest.fn() };
  const initializeSdk = jest.fn<void, [AliyunOptions]>();

  const options = (index = 0) => {
    const value = initializeSdk.mock.calls[index]?.[0];
    if (!value) {
      throw new Error(`Missing SDK initialization ${index}`);
    }
    return value;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockUseTranslation.mockReturnValue({ i18n: { language: 'en', resolvedLanguage: 'en' } });
    initializeSdk.mockImplementation((configuration) => {
      expect(document.querySelector(configuration.element)?.isConnected).toBe(true);
      expect(document.querySelector(configuration.button)?.isConnected).toBe(true);
      configuration.getInstance(instance);
    });
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- install the SDK contract in the jsdom test window
    Object.defineProperty(window, 'initAliyunCaptcha', {
      configurable: true,
      writable: true,
      value: initializeSdk,
    });
  });

  afterEach(() => {
    cleanup();
    document.querySelector(`#${scriptId}`)?.remove();
    Reflect.deleteProperty(window, 'initAliyunCaptcha');
    Reflect.deleteProperty(window, 'AliyunCaptchaConfig');
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('does not initialize the SDK on a profile route without CaptchaBox', () => {
    render(<TestApp initialPath="/continue" />);

    expect(getContext().isCaptchaRequired).toBe(true);
    expect(document.querySelector(`#${aliyunCaptchaElementId}`)).toBeNull();
    expect(document.querySelector(`#${aliyunCaptchaTriggerId}`)).toBeNull();
    expect(document.querySelector(`#${scriptId}`)).toBeNull();
    expect(initializeSdk).not.toHaveBeenCalled();
  });

  it('binds only to committed route DOM and cancels verification before navigating away', async () => {
    const { getByText } = render(<TestApp />);
    const oldElement = document.querySelector(`#${aliyunCaptchaElementId}`);
    const oldTrigger = document.querySelector(`#${aliyunCaptchaTriggerId}`);
    expect(initializeSdk).toHaveBeenCalledTimes(1);
    expect(document.querySelector(options().element)).toBe(oldElement);
    expect(document.querySelector(options().button)).toBe(oldTrigger);

    const pending = getContext().executeCaptcha();
    const rejected = expect(pending).rejects.toThrow(Error);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(getByText('Complete profile'));
    await rejected;

    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(oldElement?.isConnected).toBe(false);
    expect(oldTrigger?.isConnected).toBe(false);
    expect(document.querySelector(`#${aliyunCaptchaTriggerId}`)).toBeNull();

    fireEvent.click(getByText('Registration'));
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(document.querySelector(options(1).element)).not.toBe(oldElement);
    expect(document.querySelector(options(1).button)).not.toBe(oldTrigger);
    const retry = getContext().executeCaptcha();
    await act(async () => {
      await Promise.resolve();
    });
    options(1).success('remounted-token');
    await expect(retry).resolves.toBe('remounted-token');
  });

  it('reinitializes a mounted widget when the configured scene changes', async () => {
    const { rerender } = render(<TestApp />);
    const pending = getContext().executeCaptcha();
    const rejected = expect(pending).rejects.toThrow(Error);
    const updatedSettings: SignInExperienceResponse = {
      ...settings,
      captchaConfig: {
        type: CaptchaType.Aliyun,
        region: AliyunCaptchaRegion.China,
        prefix: 'updated-prefix',
        sceneId: 'updated-scene',
      },
    };
    rerender(<TestApp experienceSettings={updatedSettings} />);
    await rejected;

    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(options(1).SceneId).toBe('updated-scene');
    expect(window.AliyunCaptchaConfig?.prefix).toBe('updated-prefix');
    const retry = getContext().executeCaptcha();
    await act(async () => {
      await Promise.resolve();
    });
    options(1).success('updated-scene-token');
    await expect(retry).resolves.toBe('updated-scene-token');
  });

  it('reinitializes the visible challenge in the newly selected language', async () => {
    const { rerender } = render(<TestApp />);
    expect(options().language).toBe('en');
    mockUseTranslation.mockReturnValue({ i18n: { language: 'zh-CN', resolvedLanguage: 'zh-CN' } });

    rerender(<TestApp />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(options(1).language).toBe('cn');
  });

  it('cleans up StrictMode replay and leaves the current widget usable', async () => {
    render(
      <StrictMode>
        <TestApp />
      </StrictMode>
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(initializeSdk).toHaveBeenCalledTimes(2);
    expect(instance.destroy).toHaveBeenCalledTimes(1);

    const pending = getContext().executeCaptcha();
    await act(async () => {
      await Promise.resolve();
    });
    options(1).success('strict-mode-token');
    await expect(pending).resolves.toBe('strict-mode-token');
  });
});
