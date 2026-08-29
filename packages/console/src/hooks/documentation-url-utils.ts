const helpCenterLanguages = new Map(
  [
    'ar',
    'cs',
    'de',
    'en',
    'es',
    'fa-IR',
    'fr',
    'it',
    'ja',
    'ko',
    'pl-PL',
    'pt-BR',
    'pt-PT',
    'ru',
    'th',
    'tr-TR',
    'uk-UA',
    'zh-CN',
    'zh-HK',
    'zh-TW',
  ].map((locale) => [locale.toLowerCase(), locale])
);

export const resolveHelpCenterLanguage = (language: string) => {
  const normalizedLanguage = language.toLocaleLowerCase();
  return (
    helpCenterLanguages.get(normalizedLanguage) ??
    helpCenterLanguages.get(normalizedLanguage.split('-')[0] ?? '') ??
    'en'
  );
};

export const resolveHelpCenterPagePath = (pagePath: string) =>
  pagePath.replace(/^\//, '').replaceAll(/logto/gi, 'iden');
