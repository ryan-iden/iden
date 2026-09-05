import { connectorMetadataTranslations, translateConnectorMetadata } from './connector-metadata';

const protectedParts = (text: string) =>
  text
    .match(/`[^`]*`|{{[^}]+}}|https?:\/\/\S+/g)
    ?.slice()
    .sort() ?? [];

describe('connector display metadata', () => {
  it('translates known labels and explanations in simplified and traditional Chinese', () => {
    expect(translateConnectorMetadata('Client Secret', 'zh-CN')).toBe('客户端机密');
    expect(translateConnectorMetadata('Client Secret', 'zh-TW')).toBe('用戶端機密');
    expect(translateConnectorMetadata('Client Secret', 'zh-HK')).toBe('用戶端機密');
    expect(translateConnectorMetadata('Client Secret', 'en')).toBe('Client Secret');
    expect(translateConnectorMetadata('Client Secret', 'de')).toBe('Client Secret');
    expect(translateConnectorMetadata('  Scope ', 'zh-CN')).toBe('作用域');
  });

  it('preserves custom text, provider names, example values and protocol identifiers', () => {
    for (const value of [
      'openid offline_access',
      '<client-id>',
      'https://example.com',
      'Google',
      'RSA-SHA256',
      'My own connector',
    ]) {
      expect(translateConnectorMetadata(value, 'zh-CN')).toBe(value);
    }
    expect(translateConnectorMetadata(undefined, 'zh-CN')).toBeUndefined();
  });

  it('keeps embedded code, placeholders and URLs intact', () => {
    expect(new Set(connectorMetadataTranslations.map(([source]) => source)).size).toBe(
      connectorMetadataTranslations.length
    );
    for (const [source, cn, tw] of connectorMetadataTranslations) {
      expect(cn).not.toBe(source);
      expect(tw).not.toBe(source);
      expect(protectedParts(cn)).toEqual(protectedParts(source));
      expect(protectedParts(tw)).toEqual(protectedParts(source));
    }
  });
});
