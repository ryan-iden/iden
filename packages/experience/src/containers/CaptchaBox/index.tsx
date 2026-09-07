import { CaptchaType, RecaptchaEnterpriseMode } from '@logto/schemas';
import { useContext } from 'react';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';
import {
  aliyunCaptchaElementId,
  aliyunCaptchaTriggerId,
} from '@/Providers/CaptchaContextProvider/constant';

import styles from './index.module.scss';

const CaptchaBox = () => {
  const { captchaConfig, widgetRef, isCaptchaRequired } = useContext(CaptchaContext);

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
        <div ref={widgetRef} id={aliyunCaptchaElementId} />
        <button
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
