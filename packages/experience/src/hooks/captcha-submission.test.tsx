import { AliyunCaptchaRegion, CaptchaType, SignInIdentifier } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import CaptchaContext, {
  type CaptchaContextType,
} from '@/Providers/CaptchaContextProvider/CaptchaContext';
import {
  identifyAndSubmitInteraction,
  registerWithUsername,
  signInWithPasswordIdentifier,
} from '@/apis/experience';
import { sendVerificationCodeApi } from '@/apis/utils';
import useRegisterWithUsername from '@/components/IdentifierRegisterForm/use-register-with-username';
import { UserFlow } from '@/types';

import usePasswordSignIn from './use-password-sign-in';
import useSendVerificationCode from './use-send-verification-code';

const executeCaptcha = jest.fn<
  ReturnType<CaptchaContextType['executeCaptcha']>,
  Parameters<CaptchaContextType['executeCaptcha']>
>();
const setToast = jest.fn();
const navigate = jest.fn();
const redirectTo = jest.fn();
const checkSingleSignOn = jest.fn();

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(),
  registerWithUsername: jest.fn(),
  identifyAndSubmitInteraction: jest.fn(),
}));

jest.mock('@/apis/utils', () => ({ sendVerificationCodeApi: jest.fn() }));
jest.mock('./use-toast', () => ({ __esModule: true, default: () => ({ setToast }) }));
jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => navigate,
}));
jest.mock('./use-global-redirect-to', () => ({ __esModule: true, default: () => redirectTo }));
jest.mock('./use-check-single-sign-on', () => ({
  __esModule: true,
  default: () => ({ onSubmit: checkSingleSignOn }),
}));
jest.mock('./use-error-handler', () => ({ __esModule: true, default: () => jest.fn() }));
jest.mock('./use-submit-interaction-error-handler', () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock('./use-sie', () => ({
  useSieMethods: () => ({ passwordRequiredForSignUp: false, secondaryIdentifiers: [] }),
  useForgotPasswordSettings: () => ({ isForgotPasswordEnabled: false }),
}));

const captchaContext: CaptchaContextType = {
  isCaptchaRequired: true,
  captchaConfig: {
    type: CaptchaType.Aliyun,
    region: AliyunCaptchaRegion.China,
    prefix: 'prefix',
    sceneId: 'scene',
  },
  executeCaptcha,
  widgetRef: undefined,
};

const Wrapper = ({ children }: { readonly children: ReactNode }) => (
  <CaptchaContext.Provider value={captchaContext}>{children}</CaptchaContext.Provider>
);

const disabledCaptchaContext: CaptchaContextType = {
  ...captchaContext,
  isCaptchaRequired: false,
  captchaConfig: undefined,
};

const DisabledWrapper = ({ children }: { readonly children: ReactNode }) => (
  <CaptchaContext.Provider value={disabledCaptchaContext}>{children}</CaptchaContext.Provider>
);

describe('CAPTCHA submission boundaries', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    executeCaptcha.mockResolvedValue('captcha-token');
    jest.mocked(sendVerificationCodeApi).mockResolvedValue({ verificationId: 'verification-id' });
    jest.mocked(signInWithPasswordIdentifier).mockResolvedValue({ redirectTo: '/callback' });
    jest.mocked(identifyAndSubmitInteraction).mockResolvedValue({ redirectTo: '/callback' });
  });

  it.each([UserFlow.SignIn, UserFlow.Register, UserFlow.ForgotPassword])(
    'passes the CAPTCHA token when starting a %s verification-code interaction',
    async (flow) => {
      const { result } = renderHook(() => useSendVerificationCode(flow), { wrapper: Wrapper });

      await act(async () => {
        await result.current.onSubmit({
          identifier: SignInIdentifier.Email,
          value: 'test@example.com',
        });
      });

      expect(executeCaptcha).toHaveBeenCalledTimes(1);
      expect(sendVerificationCodeApi).toHaveBeenCalledWith(
        flow,
        { type: SignInIdentifier.Email, value: 'test@example.com' },
        undefined,
        'captcha-token'
      );
      expect(navigate).toHaveBeenCalledTimes(1);
    }
  );

  it('handles a rejected verification-code challenge and allows retry without sending an unverified request', async () => {
    executeCaptcha.mockRejectedValueOnce(new Error('Alibaba Cloud Captcha was closed'));
    const { result } = renderHook(() => useSendVerificationCode(UserFlow.Register), {
      wrapper: Wrapper,
    });
    const payload = { identifier: SignInIdentifier.Email, value: 'test@example.com' } as const;

    await act(async () => {
      await expect(result.current.onSubmit(payload)).resolves.toBeUndefined();
    });

    expect(setToast).toHaveBeenCalledTimes(1);
    expect(setToast).toHaveBeenCalledWith('error.captcha_verification_failed');
    expect(sendVerificationCodeApi).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onSubmit(payload);
    });

    expect(sendVerificationCodeApi).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('still submits when CAPTCHA is disabled and the provider returns no token', async () => {
    executeCaptcha.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSendVerificationCode(UserFlow.Register), {
      wrapper: DisabledWrapper,
    });

    await act(async () => {
      await result.current.onSubmit({
        identifier: SignInIdentifier.Email,
        value: 'test@example.com',
      });
    });

    expect(sendVerificationCodeApi).toHaveBeenCalledTimes(1);
    expect(setToast).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'ignores a CAPTCHA result after the form unmounts (rejected: %s)',
    async (shouldReject) => {
      executeCaptcha.mockImplementationOnce(async () => {
        if (shouldReject) {
          throw new Error('Alibaba Cloud Captcha was unmounted');
        }
        return 'late-token';
      });
      const { result, unmount } = renderHook(() => useSendVerificationCode(UserFlow.Register), {
        wrapper: Wrapper,
      });
      const submission = result.current.onSubmit({
        identifier: SignInIdentifier.Email,
        value: 'test@example.com',
      });
      unmount();
      await expect(submission).resolves.toBeUndefined();

      expect(setToast).not.toHaveBeenCalled();
      expect(sendVerificationCodeApi).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
  );

  it('stops password sign-in before SSO checks or API calls on rejection, then sends a fresh token on retry', async () => {
    executeCaptcha.mockRejectedValueOnce(new Error('Alibaba Cloud Captcha failed to load'));
    const { result } = renderHook(() => usePasswordSignIn(), { wrapper: Wrapper });
    const payload = {
      identifier: { type: SignInIdentifier.Email, value: 'test@example.com' },
      password: 'password',
    } as const;

    await act(async () => {
      await expect(result.current.onSubmit(payload)).resolves.toBeUndefined();
    });

    expect(setToast).toHaveBeenCalledTimes(1);
    expect(setToast).toHaveBeenCalledWith('error.captcha_verification_failed');
    expect(checkSingleSignOn).not.toHaveBeenCalled();
    expect(signInWithPasswordIdentifier).not.toHaveBeenCalled();
    expect(redirectTo).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onSubmit(payload);
    });

    expect(signInWithPasswordIdentifier).toHaveBeenCalledTimes(1);
    expect(signInWithPasswordIdentifier).toHaveBeenCalledWith(payload, 'captcha-token');
    expect(redirectTo).toHaveBeenCalledTimes(1);
    expect(redirectTo).toHaveBeenCalledWith('/callback');
  });

  it('stops username registration and interaction submission on rejection, then accepts a verified retry', async () => {
    executeCaptcha.mockRejectedValueOnce(new Error('Alibaba Cloud Captcha verification timed out'));
    const { result } = renderHook(() => useRegisterWithUsername(), { wrapper: Wrapper });

    await act(async () => {
      await expect(result.current.onSubmit('testuser')).resolves.toBeUndefined();
    });

    expect(setToast).toHaveBeenCalledTimes(1);
    expect(setToast).toHaveBeenCalledWith('error.captcha_verification_failed');
    expect(registerWithUsername).not.toHaveBeenCalled();
    expect(identifyAndSubmitInteraction).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(redirectTo).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onSubmit('testuser');
    });

    expect(registerWithUsername).toHaveBeenCalledTimes(1);
    expect(registerWithUsername).toHaveBeenCalledWith('testuser', 'captcha-token');
    expect(identifyAndSubmitInteraction).toHaveBeenCalledTimes(1);
    expect(redirectTo).toHaveBeenCalledTimes(1);
    expect(redirectTo).toHaveBeenCalledWith('/callback');
  });
});
