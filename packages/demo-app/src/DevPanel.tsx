import { useLogto } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import { decodeJwt } from 'jose';
import { useCallback, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import useInterfaceTranslation from './i18n/use-interface-translation';
import { productBrand } from './product-brand';
import { getLocalData, setLocalData } from './utils';

const safeDecodeJwt = (token: string) => {
  try {
    return decodeJwt(token);
  } catch {
    return token;
  }
};

const DevPanel = () => {
  const { t: tUi } = useInterfaceTranslation();
  const config = getLocalData('config');
  const [showSaved, setShowSaved] = useState(false);
  const { getAccessToken, getIdTokenClaims, fetchUserInfo } = useLogto();

  const submitConfig: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setLocalData('config', data);
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 500);
  }, []);

  const requestToken: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const token = await getAccessToken(
        data.resource ? String(data.resource) : undefined,
        data.organizationId ? String(data.organizationId) : undefined
      );
      console.log(token ? safeDecodeJwt(token) : 'No token');
    },
    [getAccessToken]
  );

  return (
    <div className={[styles.card, styles.devPanel].join(' ')}>
      <form onSubmit={submitConfig}>
        <div className={styles.title}>
          {productBrand.productName} {tUi('configuration')}
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('app_id')}</div>
          <input
            name="appId"
            defaultValue={config.appId}
            type="text"
            placeholder={demoAppApplicationId}
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('extra_parameters')}</div>
          <input
            name="signInExtraParams"
            defaultValue={config.signInExtraParams}
            type="text"
            placeholder="foo=bar&baz=qux"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('prompt')}</div>
          <input
            name="prompt"
            defaultValue={config.prompt}
            type="text"
            placeholder="login consent"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('scope')}</div>
          <input name="scope" defaultValue={config.scope} type="text" placeholder="foo bar" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('resources_space_delimited')}</div>
          <input name="resource" defaultValue={config.resource} type="text" />
        </div>
        <div className={styles.action}>
          <div className={styles.text}>{tUi('sign_out_to_apply')}</div>
          <button type="submit" className={styles.button}>
            {showSaved ? tUi('saved') : tUi('save')}
          </button>
        </div>
      </form>
      <form onSubmit={requestToken}>
        <div className={styles.title}>{tUi('refresh_token_grant')}</div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('resource')}</div>
          <input name="resource" type="text" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>{tUi('organization_id')}</div>
          <input name="organizationId" type="text" />
        </div>
        <div className={styles.action}>
          <div className={styles.text}>{tUi('console_result')}</div>
          <button type="submit" className={styles.button}>
            {tUi('request_token')}
          </button>
        </div>
      </form>
      <div>
        <div className={styles.title}>{tUi('user_info')}</div>
        <div className={styles.text}>{tUi('console_result')}</div>
        <p>
          <button
            className={styles.button}
            onClick={async () => {
              console.log(await getIdTokenClaims());
            }}
          >
            {tUi('get_id_token_claims')}
          </button>
        </p>
        <p>
          <button
            className={styles.button}
            onClick={async () => {
              console.log(await fetchUserInfo());
            }}
          >
            {tUi('fetch_user_info')}
          </button>
        </p>
      </div>
    </div>
  );
};
export default DevPanel;
