import classNames from 'classnames';
import { Building2, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

type Scope = {
  readonly path: string;
  readonly title: 'users' | 'organizations';
  readonly Icon: typeof UsersRound;
};

type Props = {
  readonly className?: string;
};

const scopes: Scope[] = [
  { path: '/users', title: 'users', Icon: UsersRound },
  { path: '/organizations', title: 'organizations', Icon: Building2 },
];

/**
 * The identity area intentionally keeps its two destinations close to the page title.
 * This makes the relationship between user and organization administration explicit without
 * taking a second level of navigation space from the workspace sidebar.
 */
function IdentityScopeSwitcher({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getTo, match } = useTenantPathname();

  return (
    <nav className={classNames(styles.switcher, className)} aria-label={t('tab_sections.identity')}>
      {scopes.map(({ path, title, Icon }) => {
        const isActive = match(path);

        return (
          <Link
            key={path}
            to={getTo(path)}
            className={styles.item}
            data-active={isActive || undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
            <span>{t(`tabs.${title}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default IdentityScopeSwitcher;
