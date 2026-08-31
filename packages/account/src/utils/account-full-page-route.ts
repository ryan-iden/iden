import { organizationsRoute } from '@ac/constants/routes';

/** Keep organization sub-routes in the same full-page shell as the organization list. */
export const isAccountFullPageRoute = (pathname: string, routes: readonly string[]) =>
  routes.some(
    (route) =>
      pathname === route ||
      (route === organizationsRoute && pathname.startsWith(`${organizationsRoute}/`))
  );
