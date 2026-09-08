import { describe, expect, it } from 'vitest';

import {
  createAdminTenantSignInExperience,
  createDefaultSignInExperience,
} from './sign-in-experience.js';
import { adminTenantId } from './tenant.js';

describe('createAdminTenantSignInExperience', () => {
  it('seeds an empty passwordPolicy by default', () => {
    const row = createAdminTenantSignInExperience();
    expect(row.passwordPolicy).toEqual({});
  });

  it('seeds an empty passwordPolicy when option is explicitly false', () => {
    const row = createAdminTenantSignInExperience({ disablePwnedPasswordCheck: false });
    expect(row.passwordPolicy).toEqual({});
  });

  it('seeds rejects.pwned=false when disablePwnedPasswordCheck is true', () => {
    const row = createAdminTenantSignInExperience({ disablePwnedPasswordCheck: true });
    expect(row.passwordPolicy).toEqual({ rejects: { pwned: false } });
  });

  it('still targets the admin tenant id when the option is set', () => {
    const row = createAdminTenantSignInExperience({ disablePwnedPasswordCheck: true });
    expect(row.tenantId).toBe(adminTenantId);
  });
});

describe('createDefaultSignInExperience', () => {
  it('uses the glacier palette and system-capable dark theme only for new self-hosted tenants', () => {
    expect(createDefaultSignInExperience('new-tenant', false).color).toEqual({
      primaryColor: '#007C91',
      darkPrimaryColor: '#67E8F9',
      isDarkModeEnabled: true,
    });
    expect(createDefaultSignInExperience('cloud-tenant', true).color).toMatchObject({
      primaryColor: '#6139F6',
      isDarkModeEnabled: false,
    });
    expect(createAdminTenantSignInExperience().color.primaryColor).toBe('#6139F6');
    expect(createAdminTenantSignInExperience({ isCloud: false }).color.primaryColor).toBe(
      '#007C91'
    );
  });

  it('still has a two-parameter signature and seeds an empty passwordPolicy', () => {
    const row = createDefaultSignInExperience('some-tenant-id', false);
    expect(row.passwordPolicy).toEqual({});
  });

  it('keeps legacy null signUpProfileFields for seeded default tenants', () => {
    const row = createDefaultSignInExperience('some-tenant-id', false);
    expect(row.signUpProfileFields).toBeNull();
  });
});
