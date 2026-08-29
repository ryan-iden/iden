export type ProductBrand = 'iden' | 'logto';

export type BrandProfile = {
  readonly id: ProductBrand;
  readonly productName: string;
  readonly slogan: string;
  readonly primaryColor: string;
  readonly darkPrimaryColor: string;
  readonly consoleTitle: string;
  readonly helpCenterPath: string;
};

export const idenBrandProfile: BrandProfile = Object.freeze({
  id: 'iden',
  productName: 'iden',
  slogan: 'Identity, Unified.',
  primaryColor: '#5B5CF6',
  darkPrimaryColor: '#8B8CFF',
  consoleTitle: 'iden',
  helpCenterPath: '/help',
});

export const logtoBrandProfile: BrandProfile = Object.freeze({
  id: 'logto',
  productName: 'Logto',
  slogan: 'The better identity infrastructure for developers',
  primaryColor: '#5D34F2',
  darkPrimaryColor: '#7958FF',
  consoleTitle: 'Logto Cloud',
  helpCenterPath: 'https://docs.logto.io',
});

/** Resolve the user-facing product brand without changing Logto protocol or SDK identifiers. */
export const resolveBrandProfile = (isCloud: boolean): BrandProfile =>
  isCloud ? logtoBrandProfile : idenBrandProfile;

export const isCloudBrandEnvironment = (value: unknown): boolean =>
  value === true || value === 1 || (typeof value === 'string' && /^(1|true|yes)$/i.test(value));

const inheritedProductHosts = new Set(
  ['docs', 'cloud', 'numbers'].map((subdomain) => [subdomain, 'logto', 'io'].join('.'))
);
const selfHostedProductHosts = new Set([
  'help.iden.local',
  'console.iden.local',
  'telemetry.iden.local',
]);
const helpCenterLocales = new Set([
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
]);

const normalizeHelpCenterLocale = (locale: string) => {
  const exactLocale = [...helpCenterLocales].find(
    (candidate) => candidate.toLowerCase() === locale.toLowerCase()
  );
  if (exactLocale) {
    return exactLocale;
  }

  const baseLanguage = locale.split('-', 1)[0]?.toLowerCase();
  return [...helpCenterLocales].find((candidate) => candidate === baseLanguage) ?? 'en';
};

/** Resolve inherited product links to the same-origin help center in self-hosted frontends. */
export const resolveSelfHostedHelpLink = (
  value: string,
  locale = 'en',
  origin = 'https://iden.invalid'
): string | undefined => {
  const url = new URL(value, origin);
  if (!inheritedProductHosts.has(url.hostname) && !selfHostedProductHosts.has(url.hostname)) {
    return undefined;
  }

  const route =
    url.hostname === ['docs', 'logto', 'io'].join('.') || url.hostname === 'help.iden.local'
      ? url.pathname.replaceAll(/logto/gi, 'iden')
      : '/introduction/';
  return `/help/${normalizeHelpCenterLocale(locale)}${
    route.startsWith('/') ? route : `/${route}`
  }${url.hash}`;
};

/** Keep every inherited product link inside the self-hosted deployment. */
export const installSelfHostedHelpNavigation = (
  getLocale: () => string = () => document.documentElement.lang || 'en'
): (() => void) => {
  const handleClick = (event: MouseEvent) => {
    const anchor = event
      .composedPath()
      .find((target): target is HTMLAnchorElement => target instanceof HTMLAnchorElement);
    if (!anchor) {
      return;
    }

    const helpLink = resolveSelfHostedHelpLink(anchor.href, getLocale(), window.location.origin);
    if (!helpLink) {
      return;
    }

    event.preventDefault();
    window.location.assign(helpLink);
  };

  document.addEventListener('click', handleClick);
  return () => {
    document.removeEventListener('click', handleClick);
  };
};

const protectedProductTokens = [
  /Logto-ID-Token/g,
  /Logto-Host/g,
  /@logto\/[\w./-]+/gi,
  /\burn:logto:[\w./:-]+/gi,
  /\blogto-[\w-]+/gi,
  /\bLogto(?:Client|RequestError|Error|Config|Provider)\b/g,
];

/** Rebrand prose while preserving protocol, package, component, and header identifiers. */
export const rebrandProductText = (value: string, isCloud: boolean): string => {
  if (isCloud || !/logto/i.test(value)) {
    return value;
  }

  const withPlaceholders = protectedProductTokens.reduce(
    (result, pattern) =>
      result.replaceAll(pattern, (match) => {
        const encoded = [...match]
          .map((character) => character.codePointAt(0)?.toString(16) ?? '')
          .join('-');
        return `__IDEN_COMPAT_${encoded}__`;
      }),
    value
  );

  return withPlaceholders
    .replaceAll('Logto Cloud', 'iden')
    .replaceAll('Logto', 'iden')
    .replaceAll('LOGTO', 'IDEN')
    .replaceAll(/__IDEN_COMPAT_([\da-f-]+)__/g, (_, encoded: string) =>
      String.fromCodePoint(...encoded.split('-').map((codePoint) => Number.parseInt(codePoint, 16)))
    );
};

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);
const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !isUnknownArray(value);

/** Apply self-hosted product wording to an i18n resource without mutating the source bundle. */
export function rebrandProductPhrases<Value>(value: Value, isCloud: boolean): Value;
export function rebrandProductPhrases(value: unknown, isCloud: boolean): unknown {
  if (isCloud) {
    return value;
  }

  if (typeof value === 'string') {
    return rebrandProductText(value, false);
  }

  if (isUnknownArray(value)) {
    return value.map((item) => rebrandProductPhrases(item, false));
  }

  if (isUnknownRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rebrandProductPhrases(item, false)])
    );
  }

  return value;
}
