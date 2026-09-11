import { CaptchaType, RecaptchaEnterpriseMode } from '@logto/schemas';
import { useContext, useEffect, useRef } from 'react';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';
import {
  aliyunCaptchaElementId,
  aliyunCaptchaTriggerId,
} from '@/Providers/CaptchaContextProvider/constant';

import styles from './index.module.scss';

const CaptchaBox = () => {
  const { captchaConfig, widgetRef, isCaptchaRequired, mountAliyunCaptcha } =
    useContext(CaptchaContext);
  const aliyunElementRef = useRef<HTMLDivElement>(null);
  const aliyunTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (aliyunElementRef.current && aliyunTriggerRef.current) {
      return mountAliyunCaptcha?.(aliyunElementRef.current, aliyunTriggerRef.current);
    }
  }, [captchaConfig, isCaptchaRequired, mountAliyunCaptcha]);

  // Check if widget rendering is needed
  // Turnstile and Alibaba Cloud Captcha need a widget host. reCAPTCHA Enterprise needs it only in checkbox mode.
  const needsWidget =
    isCaptchaRequired &&
    captchaConfig &&
    (captchaConfig.type === CaptchaType.Turnstile ||
      captchaConfig.type === CaptchaType.Aliyun ||
      captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox);

  if (!needsWidget) {
    return null;
  }

  if (captchaConfig.type === CaptchaType.Aliyun) {
    return (
      <div className={styles.aliyunCaptchaBox}>
        <div ref={aliyunElementRef} id={aliyunCaptchaElementId} />
        <button
          ref={aliyunTriggerRef}
          aria-hidden
          className={styles.aliyunCaptchaTrigger}
          id={aliyunCaptchaTriggerId}
          tabIndex={-1}
          type="button"
        />
      </div>
    );
  }

  return <div ref={widgetRef} className={styles.captchaBox} />;
};

export default CaptchaBox;
