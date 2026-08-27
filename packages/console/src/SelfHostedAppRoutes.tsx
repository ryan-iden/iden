import { Suspense, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AppError from '@/components/AppError';
import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import RedirectToAccountCenter from '@/components/RedirectToAccountCenter';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute, GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import OneTimeTokenLanding from '@/pages/OneTimeTokenLanding';

function TenantHome() {
  const { tenants } = useContext(TenantsContext);
  const firstTenant = tenants[0];

  return firstTenant ? (
    <Navigate replace to={`/${firstTenant.id}`} />
  ) : (
    <AppError errorMessage="No accessible tenant was found." />
  );
}

/** Global routes used by the self-hosted multi-tenant console. */
function SelfHostedAppRoutes() {
  return (
    <Suspense fallback={<DelayedSuspenseFallback />}>
      <Routes>
        <Route path={GlobalAnonymousRoute.Callback} element={<Callback />} />
        <Route path={GlobalAnonymousRoute.OneTimeTokenLanding} element={<OneTimeTokenLanding />} />
        <Route
          path={`${GlobalRoute.AcceptInvitation}/:invitationId`}
          element={<AcceptInvitation />}
        />
        <Route element={<ProtectedRoutes />}>
          <Route path={GlobalRoute.Profile + '/*'} element={<RedirectToAccountCenter />} />
          <Route index element={<TenantHome />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default SelfHostedAppRoutes;
