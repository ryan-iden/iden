import { useTranslation } from 'react-i18next';

/** Shared interface copy also used by the account, sign-in, and help experiences. */
export default function useInterfaceTranslation() {
  return useTranslation('experience', { keyPrefix: 'interface' });
}
