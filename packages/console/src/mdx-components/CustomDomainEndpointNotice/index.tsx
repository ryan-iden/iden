import { Trans } from 'react-i18next';

import { isCloud } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

type Props = {
  readonly variant?: 'access' | 'replace';
};

function CustomDomainEndpointNotice(_props: Props) {
  const { t } = useInterfaceTranslation();
  if (!isCloud) {
    return null;
  }

  return (
    <InlineNotification>
      <Trans
        t={t}
        i18nKey="custom_domains_notice"
        values={{ endpoint: 'https://{{custom_domain}}/' }}
        components={{
          a: (
            <TextLink
              href="https://docs.logto.io/logto-cloud/custom-domain"
              targetBlank="noopener"
            />
          ),
          code: <code />,
        }}
      />
    </InlineNotification>
  );
}

export default CustomDomainEndpointNotice;
