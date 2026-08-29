import { Theme } from '@logto/schemas';
import { type ReactNode } from 'react';

import UserRoleIconDark from '@/assets/icons/role-feature-dark.svg?react';
import UserRoleIcon from '@/assets/icons/role-feature.svg?react';
import { isCloud } from '@/consts/env';
import useTheme from '@/hooks/use-theme';

import { IdenProductIcon } from '../IdenProductIcon';

const themeToRoleIcon = Object.freeze({
  [Theme.Light]: <UserRoleIcon />,
  [Theme.Dark]: <UserRoleIconDark />,
} satisfies Record<Theme, ReactNode>);

/** Render a role icon according to the current theme. */
function RoleIcon() {
  const theme = useTheme();

  if (!isCloud) {
    return <IdenProductIcon name="roleAccess" />;
  }

  return themeToRoleIcon[theme];
}

export default RoleIcon;
