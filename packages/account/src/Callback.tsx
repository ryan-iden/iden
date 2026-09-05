import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

import { clearVerificationRecord } from './Providers/PageContextProvider/verification-storage';
import GlobalLoading from './components/GlobalLoading';
import useInterfaceTranslation from './hooks/use-interface-translation';

const Callback = () => {
  const { t: tUi } = useInterfaceTranslation();
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
    clearVerificationRecord();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.replace('/account');
  });

  if (error) {
    return (
      <>
        <p>{tUi('callback_failed')}</p>
        <pre>{error.message}</pre>
        <button
          type="button"
          onClick={() => {
            window.location.replace('/account');
          }}
        >
          {tUi('back_sign_in')}
        </button>
      </>
    );
  }

  return <GlobalLoading />;
};

export default Callback;
