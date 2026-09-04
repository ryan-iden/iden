import resources, { builtInLanguages } from '@logto/phrases-experience';
import { OrganizationManagementRoleType, organizationManagementPermissions } from '@logto/schemas';
import { createInstance } from 'i18next';

import {
  getManagementRoleDescription,
  getManagementRoleName,
  getMemberDisplayName,
  getOrganizationActivityLabel,
  organizationActivityLabels,
} from './presentation';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({ resources, lng: 'zh-CN', fallbackLng: [] });
});

it('uses the username consistently, with safe fallbacks for incomplete or legacy profiles', () => {
  const member = {
    id: 'user-id',
    username: 'ryan',
    name: 'Ryan Wong',
    primaryEmail: 'ryan@example.com',
  };
  expect(getMemberDisplayName(member)).toBe('ryan');
  expect(getMemberDisplayName({ ...member, username: null })).toBe('Ryan Wong');
  expect(getMemberDisplayName({ ...member, username: undefined, name: ' ' })).toBe(
    'ryan@example.com'
  );
  expect(getMemberDisplayName({ ...member, username: '', name: null, primaryEmail: null })).toBe(
    'user-id'
  );
});

it('translates built-in roles without translating user-defined names or descriptions', () => {
  const owner = { id: 'owner-role', name: 'Owner', type: OrganizationManagementRoleType.Owner };
  const administrator = {
    id: 'admin-role',
    name: 'Administrator',
    type: OrganizationManagementRoleType.Custom,
    description: 'Full organization administration without ownership-only actions.',
  };
  expect(getManagementRoleName(owner, i18n.t)).toBe('所有者');
  expect(getManagementRoleDescription(owner, i18n.t)).not.toContain('Organization');
  expect(getManagementRoleName(administrator, i18n.t)).toBe('管理员');
  expect(getManagementRoleName({ ...administrator, description: 'My custom role' }, i18n.t)).toBe(
    'Administrator'
  );
  expect(
    getManagementRoleName({ ...owner, type: OrganizationManagementRoleType.Custom }, i18n.t)
  ).toBe('Owner');
  expect(
    getManagementRoleDescription({ ...administrator, description: 'My custom role' }, i18n.t)
  ).toBe('My custom role');
});

it('maps activity keys and provides a localized fallback for future events', () => {
  expect(getOrganizationActivityLabel('Organization.Create', i18n.t)).toBe('创建组织');
  expect(getOrganizationActivityLabel('Organization.Future.Event', i18n.t)).toBe('组织活动');
});

const leafEntries = (value: Record<string, unknown>, prefix = ''): Array<[string, string]> =>
  Object.entries(value).flatMap(([key, item]) =>
    typeof item === 'string'
      ? [[`${prefix}${key}`, item]]
      : leafEntries(item as Record<string, unknown>, `${prefix}${key}.`)
  );

describe.each(builtInLanguages)('organization center locale %s', (locale) => {
  it('has all translated labels and preserves interpolation placeholders', () => {
    const source = leafEntries(resources.en.translation.account_center.organizations);
    const translations = leafEntries(resources[locale].translation.account_center.organizations);
    expect(translations.map(([key]) => key)).toEqual(source.map(([key]) => key));
    for (const [index, [key, value]] of translations.entries()) {
      expect(value.trim()).not.toBe('');
      expect(
        value
          .match(/{{\w+}}/g)
          ?.slice()
          .sort()
      ).toEqual(
        source[index]?.[1]
          .match(/{{\w+}}/g)
          ?.slice()
          .sort()
      );
      expect(
        i18n.exists(`account_center.organizations.${key}`, { lng: locale, fallbackLng: [] })
      ).toBe(true);
    }
    if (locale !== 'en') {
      expect(resources[locale].translation.account_center.organizations).not.toEqual(
        resources.en.translation.account_center.organizations
      );
    }
    for (const permission of organizationManagementPermissions) {
      expect(
        i18n.exists(`account_center.organizations.roles.permission_labels.${permission}`, {
          lng: locale,
          fallbackLng: [],
        })
      ).toBe(true);
    }
    for (const label of Object.values(organizationActivityLabels)) {
      expect(
        i18n.exists(`account_center.organizations.activity.events.${label}`, {
          lng: locale,
          fallbackLng: [],
        })
      ).toBe(true);
    }
  });
});
