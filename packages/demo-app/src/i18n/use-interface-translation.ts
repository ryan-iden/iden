import { useTranslation } from 'react-i18next';

export default function useInterfaceTranslation() {
  // The demo app starts the authorization redirect on its first render. Do not suspend that render
  // while i18next finishes initializing the additional interface namespace.
  return useTranslation('interface', { useSuspense: false });
}
