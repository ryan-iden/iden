import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';

import useInterfaceTranslation from './i18n/use-interface-translation';

const Callback = () => {
  const { t: tUi } = useInterfaceTranslation();
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.assign('/demo-app');
  });

  if (error) {
    return (
      <div>
        {tUi('error')}
        <br />
        {error.message}
      </div>
    );
  }

  return <div>{tUi('loading')}</div>;
};

export default Callback;
