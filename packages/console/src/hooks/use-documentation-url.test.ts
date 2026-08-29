import { resolveHelpCenterLanguage, resolveHelpCenterPagePath } from './documentation-url-utils';

describe('self-hosted documentation URLs', () => {
  it('keeps canonical locale casing and falls back by base language', () => {
    expect(resolveHelpCenterLanguage('zh-CN')).toBe('zh-CN');
    expect(resolveHelpCenterLanguage('pt-BR')).toBe('pt-BR');
    expect(resolveHelpCenterLanguage('en-US')).toBe('en');
    expect(resolveHelpCenterLanguage('unknown')).toBe('en');
  });

  it('maps inherited product route segments to local iden routes', () => {
    expect(resolveHelpCenterPagePath('/integrate-logto/get-started')).toBe(
      'integrate-iden/get-started'
    );
    expect(resolveHelpCenterPagePath('/logto-oss')).toBe('iden-oss');
  });
});
