import phrases from '@logto/phrases';
import experiencePhrases from '@logto/phrases-experience';
import { hookEvents, organization } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';
import i18next from 'i18next';

import { auditLogEventTitle } from '@/consts/logs';

import useLogEventTitle from './use-log-event-title';

describe('localized event labels', () => {
  beforeAll(async () => {
    for (const locale of ['en', 'zh-CN'] as const) {
      i18next.addResourceBundle(locale, 'translation', phrases[locale].translation, true, true);
      i18next.addResourceBundle(
        locale,
        'experience',
        experiencePhrases[locale].translation,
        true,
        true
      );
    }
  });

  beforeEach(async () => {
    await act(async () => {
      await i18next.changeLanguage('zh-CN');
    });
  });
  afterEach(async () => {
    await act(async () => {
      await i18next.changeLanguage('en');
    });
  });

  it('covers audit, organization and webhook event identifiers', () => {
    const { result } = renderHook(useLogEventTitle);
    const unknown = result.current('not.a.known.event');
    const keys = [
      ...Object.keys(auditLogEventTitle),
      ...hookEvents,
      ...Object.values(organization.Type).map((value) => `Organization.${value}`),
    ];
    for (const key of keys.filter((key) => key !== 'Unknown')) {
      expect({ key, label: result.current(key) }).not.toEqual({ key, label: unknown });
      expect(result.current(key)).not.toBe(key);
    }
    expect(result.current('__proto__')).toBe(unknown);
  });

  it('updates display labels when the language changes without changing the identifier', async () => {
    const { result } = renderHook(useLogEventTitle);
    const key = 'Organization.Create';
    const chinese = result.current(key);
    await act(async () => {
      await i18next.changeLanguage('en');
    });
    expect(result.current(key)).not.toBe(chinese);
    expect(key).toBe('Organization.Create');
  });
});
