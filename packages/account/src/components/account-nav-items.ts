import { Building2 } from 'lucide-react';
import type { ComponentType } from 'react';

import ProfileIcon from '@ac/assets/icons/profile.svg?react';
import SessionsIcon from '@ac/assets/icons/sessions.svg?react';
import ShieldIcon from '@ac/assets/icons/shield.svg?react';
import {
  organizationsRoute,
  profileRoute,
  securityRoute,
  sessionsRoute,
} from '@ac/constants/routes';

export type AccountNavItem = {
  readonly to: string;
  readonly labelKey:
    | 'account_center.page.sidebar_personal_info'
    | 'account_center.page.sidebar_security'
    | 'account_center.page.sidebar_sessions'
    | 'account_center.page.sidebar_organizations';
  readonly Icon: ComponentType<{ readonly className?: string }>;
};

type BuildAccountNavItemsOptions = {
  readonly hasProfile: boolean;
  readonly hasSecurity: boolean;
  readonly hasSessions: boolean;
  readonly hasOrganizations?: boolean;
};

export const buildAccountNavItems = ({
  hasProfile,
  hasSecurity,
  hasSessions,
  hasOrganizations,
}: BuildAccountNavItemsOptions): AccountNavItem[] => [
  ...(hasProfile
    ? [
        {
          to: profileRoute,
          labelKey: 'account_center.page.sidebar_personal_info' as const,
          Icon: ProfileIcon,
        },
      ]
    : []),
  ...(hasSecurity
    ? [
        {
          to: securityRoute,
          labelKey: 'account_center.page.sidebar_security' as const,
          Icon: ShieldIcon,
        },
      ]
    : []),
  ...(hasSessions
    ? [
        {
          to: sessionsRoute,
          labelKey: 'account_center.page.sidebar_sessions' as const,
          Icon: SessionsIcon,
        },
      ]
    : []),
  ...(hasOrganizations
    ? [
        {
          to: organizationsRoute,
          labelKey: 'account_center.page.sidebar_organizations' as const,
          Icon: Building2,
        },
      ]
    : []),
];
