import { describe, expect, it } from 'vitest';

import {
  AccountCenterControlValue,
  OrganizationCenterCreationMode,
  accountCenterFieldControlGuard,
  defaultOrganizationCenterSettings,
  organizationCenterSettingsGuard,
} from './account-centers.js';

describe('accountCenterFieldControlGuard', () => {
  it('allows trusted device control to be omitted', () => {
    expect(accountCenterFieldControlGuard.parse({})).toEqual({});
  });

  it.each(Object.values(AccountCenterControlValue))(
    'accepts trusted device control value %s',
    (trustedDevice) => {
      expect(accountCenterFieldControlGuard.parse({ trustedDevice })).toEqual({ trustedDevice });
    }
  );

  it('rejects an invalid trusted device control value', () => {
    expect(accountCenterFieldControlGuard.safeParse({ trustedDevice: 'Invalid' }).success).toBe(
      false
    );
  });
});

describe('organizationCenterSettingsGuard', () => {
  it('accepts the secure self-hosted defaults', () => {
    expect(organizationCenterSettingsGuard.parse(defaultOrganizationCenterSettings)).toEqual(
      defaultOrganizationCenterSettings
    );
  });

  it('requires a bounded per-user creation limit', () => {
    expect(
      organizationCenterSettingsGuard.safeParse({
        ...defaultOrganizationCenterSettings,
        creationPolicy: {
          ...defaultOrganizationCenterSettings.creationPolicy,
          mode: OrganizationCenterCreationMode.All,
          maxOrganizationsPerUser: 0,
        },
      }).success
    ).toBe(false);
  });

  it('requires invitations to expire within 30 days', () => {
    expect(
      organizationCenterSettingsGuard.safeParse({
        ...defaultOrganizationCenterSettings,
        invitationPolicy: {
          allowRegistration: true,
          expiresInDays: 31,
        },
      }).success
    ).toBe(false);
  });
});
