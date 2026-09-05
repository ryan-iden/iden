import { useTranslation } from 'react-i18next';

export default function useInterfaceTranslation() {
  return useTranslation(undefined, { keyPrefix: 'interface' });
}
