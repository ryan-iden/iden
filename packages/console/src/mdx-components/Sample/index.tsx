import { appendPath } from '@silverhand/essentials';
import { useContext } from 'react';

import { GuideContext } from '@/components/Guide';
import { githubOrgLink } from '@/consts';
import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import Spacer from '@/ds-components/Spacer';
import useInterfaceTranslation from '@/hooks/use-interface-translation';

import styles from './index.module.scss';

/** The inline banner for displaying the sample info. */
export default function Sample() {
  const { t } = useInterfaceTranslation();
  const {
    metadata: { sample },
    Logo,
  } = useContext(GuideContext);

  if (!sample) {
    return null;
  }

  return (
    <aside className={styles.sample}>
      {Logo && <Logo className={styles.logo} />}
      <hgroup>
        <header>{t('sample_title')}</header>
        <p>{t('sample_description')}</p>
      </hgroup>
      <Spacer />
      <LinkButton
        targetBlank
        type="outline"
        href={appendPath(new URL(githubOrgLink), sample.repo, 'tree/HEAD', sample.path).href}
        title={<DangerousRaw>{t('sample_action')}</DangerousRaw>}
      />
    </aside>
  );
}
