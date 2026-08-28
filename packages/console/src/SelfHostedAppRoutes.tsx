import { Suspense, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import AppError from '@/components/AppError';
import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import RedirectToAccountCenter from '@/components/RedirectToAccountCenter';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import {
  GlobalAnonymousRoute,
  GlobalRoute,
  selfHostedWelcomeRoute,
  TenantsContext,
} from '@/contexts/TenantsProvider';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import OneTimeTokenLanding from '@/pages/OneTimeTokenLanding';
import { getGlobalConsolePath, getTenantPath } from '@/utils/tenant-path';

const selfHostedTenantPathOptions = { isSelfHostedTenantManagementEnabled: true } as const;
const Welcome = safeLazy(async () => import('@/pages/Welcome'));

function TenantHome() {
  const { tenants } = useContext(TenantsContext);
  const firstTenant = tenants[0];

  return firstTenant ? (
    <Navigate replace to={getTenantPath(firstTenant.id, '', selfHostedTenantPathOptions)} />
  ) : (
    <AppError errorMessage="No accessible tenant was found." />
  );
}

/** Global routes used by the self-hosted multi-tenant console. */
function SelfHostedAppRoutes() {
  return (
    <Suspense fallback={<DelayedSuspenseFallback />}>
      <Routes>
        <Route
          path={getGlobalConsolePath(GlobalAnonymousRoute.Callback, selfHostedTenantPathOptions)}
          element={<Callback />}
        />
        <Route
          path={getGlobalConsolePath(
            GlobalAnonymousRoute.OneTimeTokenLanding,
            selfHostedTenantPathOptions
          )}
          element={<OneTimeTokenLanding />}
        />
        <Route
          path={getGlobalConsolePath(selfHostedWelcomeRoute, selfHostedTenantPathOptions)}
          element={<Welcome />}
        />
        <Route
          path={`${getGlobalConsolePath(
            GlobalRoute.AcceptInvitation,
            selfHostedTenantPathOptions
          )}/:invitationId`}
          element={<AcceptInvitation />}
        />
        <Route element={<ProtectedRoutes />}>
          <Route
            path={getGlobalConsolePath(GlobalRoute.Profile, selfHostedTenantPathOptions) + '/*'}
            element={<RedirectToAccountCenter />}
          />
          <Route index element={<TenantHome />} />
          <Route
            path={getGlobalConsolePath('', selfHostedTenantPathOptions)}
            element={<TenantHome />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default SelfHostedAppRoutes;
