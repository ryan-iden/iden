// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@logto/phrases';
import type { InterfacePhrases } from '@logto/phrases-experience/lib/interface';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: LocalePhrase & { interface: InterfacePhrases };
  }
}
