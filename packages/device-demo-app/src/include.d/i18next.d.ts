import type { InterfacePhrases } from '@logto/phrases-experience/lib/interface';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'interface';
    resources: { interface: InterfacePhrases };
  }
}
