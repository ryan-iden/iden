import { type SnakeCaseOidcConfig } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { GuideContext } from '@/components/Guide';
import { brandProfile } from '@/consts/brand';
import { openIdProviderConfigPath } from '@/consts/oidc';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { type RequestError } from '@/hooks/use-api';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

export default function EnvironmentVariables() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: tUi } = useInterfaceTranslation();
  const { app } = useContext(GuideContext);
  const { id, secret } = app ?? {};
  const { data } = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);
  const authorizationEndpoint = data?.authorization_endpoint ?? tUi('loading');
  const tokenEndpoint = data?.token_endpoint ?? tUi('loading');
  const userinfoEndpoint = data?.userinfo_endpoint ?? tUi('loading');

  return (
    <table>
      <thead>
        <tr>
          <th>Outline · {t('actions.environment_variables.title')}</th>
          <th>{brandProfile.productName}</th>
          <th>{tUi('value')}</th>
        </tr>
      </thead>
      <tbody>
        {id && (
          <tr>
            <td>OIDC_CLIENT_ID</td>
            <td>{t('application_details.application_id')}</td>
            <td>
              <CopyToClipboard value={id} />
            </td>
          </tr>
        )}
        {secret && (
          <tr>
            <td>OIDC_CLIENT_SECRET</td>
            <td>{t('application_details.application_secret')}</td>
            <td>
              <CopyToClipboard value={secret} />
            </td>
          </tr>
        )}
        <tr>
          <td>OIDC_AUTH_URI</td>
          <td>{t('application_details.authorization_endpoint')}</td>
          <td>
            <CopyToClipboard value={authorizationEndpoint} />
          </td>
        </tr>
        <tr>
          <td>OIDC_TOKEN_URI</td>
          <td>{t('application_details.token_endpoint')}</td>
          <td>
            <CopyToClipboard value={tokenEndpoint} />
          </td>
        </tr>
        <tr>
          <td>OIDC_USERINFO_URI</td>
          <td>{t('enterprise_sso_details.oidc_preview.userinfo_endpoint')}</td>
          <td>
            <CopyToClipboard value={userinfoEndpoint} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
