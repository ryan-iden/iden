import { appendPath } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import { adminTenantEndpoint } from '@/consts';
import { isCloud } from '@/consts/env';

import { resolveHelpCenterLanguage, resolveHelpCenterPagePath } from './documentation-url-utils';

const documentationSiteRoot = 'https://docs.logto.io';

const useDocumentationUrl = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const helpCenterLanguage = resolveHelpCenterLanguage(language);
  const documentationSiteUrl = isCloud
    ? documentationSiteRoot
    : appendPath(adminTenantEndpoint, 'help', helpCenterLanguage).toString().replace(/\/$/, '');

  return {
    documentationSiteUrl,
    getDocumentationUrl: (pagePath: string) =>
      appendPath(new URL(documentationSiteUrl), resolveHelpCenterPagePath(pagePath)).toString(),
  };
};

export default useDocumentationUrl;
