import { getOrganizationCenterPreviewUrl } from './organization-center-preview';

describe('organization center preview URL', () => {
  it('uses the current tenant endpoint instead of the admin console origin', () => {
    expect(
      getOrganizationCenterPreviewUrl(new URL('https://identity.example.com/console/default/'))
    ).toBe('https://identity.example.com/account/organizations');
  });

  it('does not expose a broken preview URL before the tenant endpoint loads', () => {
    expect(getOrganizationCenterPreviewUrl()).toBeUndefined();
  });
});
