import { findSupportedLanguageTag } from '@logto/language-kit';

import ar from './locales/ar/interface.js';
import cs from './locales/cs/interface.js';
import de from './locales/de/interface.js';
import en from './locales/en/interface.js';
import es from './locales/es/interface.js';
import faIR from './locales/fa-ir/interface.js';
import fr from './locales/fr/interface.js';
import it from './locales/it/interface.js';
import ja from './locales/ja/interface.js';
import ko from './locales/ko/interface.js';
import plPL from './locales/pl-pl/interface.js';
import ptBR from './locales/pt-br/interface.js';
import ptPT from './locales/pt-pt/interface.js';
import ru from './locales/ru/interface.js';
import th from './locales/th/interface.js';
import trTR from './locales/tr-tr/interface.js';
import ukUA from './locales/uk-ua/interface.js';
import zhCN from './locales/zh-cn/interface.js';
import zhHK from './locales/zh-hk/interface.js';
import zhTW from './locales/zh-tw/interface.js';

/** Small, framework-independent catalog; does not import the full sign-in resources. */
export const interfaceResources = {
  ar,
  cs,
  de,
  en,
  es,
  'fa-IR': faIR,
  fr,
  it,
  ja,
  ko,
  'pl-PL': plPL,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  ru,
  th,
  'tr-TR': trTR,
  'uk-UA': ukUA,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
};

export type InterfacePhrases = typeof en;
export type InterfacePhraseKey = keyof InterfacePhrases;

export const getInterfaceLocale = (language: string) =>
  findSupportedLanguageTag([language], Object.keys(interfaceResources), 'en');

export const getInterfacePhrases = (language: string): InterfacePhrases =>
  Object.entries(interfaceResources).find(
    ([locale]) => locale === getInterfaceLocale(language)
  )?.[1] ?? en;
