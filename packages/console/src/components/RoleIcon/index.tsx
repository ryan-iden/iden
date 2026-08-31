import { Theme } from '@logto/schemas';

import UserRoleIconDark from '@/assets/icons/role-feature-dark.svg?react';
import UserRoleIcon from '@/assets/icons/role-feature.svg?react';
import { isCloud } from '@/consts/env';
import useTheme from '@/hooks/use-theme';

import { IdenProductIcon } from '../IdenProductIcon';

type Props = {
  readonly className?: string;
};

/** Render a role icon according to the current theme. */
function RoleIcon({ className }: Props) {
  const theme = useTheme();

  if (!isCloud) {
    return <IdenProductIcon className={className} name="roleAccess" />;
  }

  const Icon = theme === Theme.Light ? UserRoleIcon : UserRoleIconDark;
  return <Icon className={className} />;
}

export default RoleIcon;
