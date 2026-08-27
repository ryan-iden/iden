import { shouldListDynamicApp } from './utils';

describe('shouldListDynamicApp', () => {
  it('returns true on the first page of the third-party apps tab when enabled', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: true, page: 1 })
    ).toBe(true);
  });

  it('returns false when the dynamic app is disabled', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: false, page: 1 })
    ).toBe(false);
  });

  it('returns false on the my apps tab', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: false, isDynamicAppEnabled: true, page: 1 })
    ).toBe(false);
  });

  it('returns false beyond the first page', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: true, page: 2 })
    ).toBe(false);
  });
});
