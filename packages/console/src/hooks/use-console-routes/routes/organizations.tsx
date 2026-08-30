import { condArray } from '@silverhand/essentials';
import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { isSelfHostedParityEnabled } from '@/consts/env';
import { OrganizationDetailsTabs } from '@/pages/OrganizationDetails/types';

const Organizations = safeLazy(async () => import('@/pages/Organizations'));
const OrganizationDetails = safeLazy(async () => import('@/pages/OrganizationDetails'));
const MachineToMachine = safeLazy(
  async () => import('@/pages/OrganizationDetails/MachineToMachine')
);
const Members = safeLazy(async () => import('@/pages/OrganizationDetails/Members'));
const Settings = safeLazy(async () => import('@/pages/OrganizationDetails/Settings'));
const Branding = safeLazy(async () => import('@/pages/OrganizationDetails/Branding'));
const ManagementAccess = safeLazy(
  async () => import('@/pages/OrganizationDetails/ManagementAccess')
);
const OrganizationActivity = safeLazy(
  async () => import('@/pages/OrganizationDetails/OrganizationActivity')
);

export const organizations: RouteObject = {
  path: 'organizations',
  children: condArray(
    { index: true, element: <Organizations /> },
    { path: 'create', element: <Organizations /> },
    {
      path: ':id/*',
      element: <OrganizationDetails />,
      children: [
        { index: true, element: <Navigate replace to={OrganizationDetailsTabs.Settings} /> },
        { path: OrganizationDetailsTabs.Settings, element: <Settings /> },
        { path: OrganizationDetailsTabs.Members, element: <Members /> },
        {
          path: OrganizationDetailsTabs.MachineToMachine,
          element: <MachineToMachine />,
        },
        {
          path: OrganizationDetailsTabs.Branding,
          element: <Branding />,
        },
        ...condArray(
          isSelfHostedParityEnabled && {
            path: OrganizationDetailsTabs.ManagementAccess,
            element: <ManagementAccess />,
          },
          isSelfHostedParityEnabled && {
            path: OrganizationDetailsTabs.Activity,
            element: <OrganizationActivity />,
          }
        ),
      ],
    }
  ),
};
