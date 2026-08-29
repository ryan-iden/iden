// eslint-disable-next-line n/prefer-global/text-decoder,n/prefer-global/text-encoder -- import Node implementations before defining missing jsdom globals
import { TextDecoder, TextEncoder } from 'node:util';

import { type LocalePhrase } from '@logto/phrases-experience';
import { ssrPlaceholder } from '@logto/schemas';
import { noop, type DeepPartial } from '@silverhand/essentials';
import structuredCloneShim from '@ungap/structured-clone';
import i18next from 'i18next';
import { createElement, forwardRef, type ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import ReactModal from 'react-modal';

/* eslint-disable @silverhand/fp/no-mutation -- jsdom 29 lacks the encoding globals Blobatar uses */
global.TextEncoder = TextEncoder;
// @ts-expect-error -- Node's TextDecoder is runtime-compatible with the DOM global in Jest.
global.TextDecoder = TextDecoder;
/* eslint-enable @silverhand/fp/no-mutation */

if (typeof document !== 'undefined') {
  ReactModal.setAppElement(document.body);
}

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: false,
}));

jest.mock('overlayscrollbars-react', () => {
  const OverlayScrollbarsComponent = forwardRef<HTMLDivElement, Readonly<{ children?: ReactNode }>>(
    ({ children }, ref) => createElement('div', { ref }, children)
  );
  return { __esModule: true, OverlayScrollbarsComponent };
});

jest.mock('@simplewebauthn/browser', () => ({
  __esModule: true,
  WebAuthnAbortService: class WebAuthnAbortService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    abort() {}
  },
  WebAuthnError: class WebAuthnError extends Error {},
  base64URLStringToBuffer: (value: string) => new Uint8Array(Buffer.from(value, 'base64url')),
  bufferToBase64URLString: (value: ArrayBuffer | Uint8Array) =>
    Buffer.from(new Uint8Array(value)).toString('base64url'),
  browserSupportsWebAuthn: () => true,
  browserSupportsWebAuthnAutofill: () => true,
  platformAuthenticatorIsAvailable: async () => true,
  startAuthentication: async () => ({}),
  startRegistration: async () => ({}),
}));

const defaultI18nResources: DeepPartial<LocalePhrase> = {
  translation: { action: { agree: 'Agree' } },
};

export const setupI18nForTesting = async (
  enPhrase: DeepPartial<LocalePhrase> = defaultI18nResources
) =>
  i18next.use(initReactI18next).init({
    resources: { en: enPhrase },
    lng: 'en',
    react: { useSuspense: false },
  });

void setupI18nForTesting();

// eslint-disable-next-line @silverhand/fp/no-mutating-methods
Object.defineProperty(global, 'logtoSsr', { value: ssrPlaceholder });

if (typeof globalThis.structuredClone !== 'function') {
  // The jsdom test environment (jest-environment-jsdom@29) does not expose
  // structuredClone; use a faithful polyfill (handles Date/Map/Set/undefined/
  // circular refs) instead of a JSON round-trip so tests don't mask cloning bugs.
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(globalThis, 'structuredClone', {
    configurable: true,
    writable: true,

    value: structuredCloneShim,
  });
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }),
  });
}
