import { organizationsRoute, profileRoute, securityRoute } from '@ac/constants/routes';

import { isAccountFullPageRoute } from './account-full-page-route';

describe('isAccountFullPageRoute', () => {
  const routes = [securityRoute, profileRoute, organizationsRoute];

  it.each([
    organizationsRoute,
    `${organizationsRoute}/organization-id/overview`,
    `${organizationsRoute}/invitations/invitation-id`,
  ])('keeps the organization route "%s" in the full-page shell', (pathname) => {
    expect(isAccountFullPageRoute(pathname, routes)).toBe(true);
  });

  it('does not promote unrelated secondary routes to the full-page shell', () => {
    expect(isAccountFullPageRoute('/username', routes)).toBe(false);
    expect(isAccountFullPageRoute('/security/details', routes)).toBe(false);
  });
});
