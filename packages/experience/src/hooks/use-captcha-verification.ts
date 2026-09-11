import { useCallback, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';

import useToast from './use-toast';

/** Keep a failed challenge distinct from a successful flow where CAPTCHA is disabled. */
const useCaptchaVerification = () => {
  const { executeCaptcha } = useContext(CaptchaContext);
  const { setToast } = useToast();
  const { t } = useTranslation();
  const isMounted = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- track the calling form across async vendor callbacks
    isMounted.current = true;
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- ignore outcomes belonging to a form the user has left
      isMounted.current = false;
    };
  }, []);

  return useCallback(async () => {
    try {
      const captchaToken = await executeCaptcha();
      if (isMounted.current) {
        return { captchaToken };
      }
    } catch {
      if (isMounted.current) {
        setToast(t('error.captcha_verification_failed'));
      }
    }
  }, [executeCaptcha, setToast, t]);
};

export default useCaptchaVerification;
