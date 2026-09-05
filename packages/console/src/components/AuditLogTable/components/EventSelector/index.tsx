import { useTranslation } from 'react-i18next';

import { logEventTitle } from '@/consts/logs';
import Select, { type Option } from '@/ds-components/Select';
import useLogEventTitle from '@/hooks/use-log-event-title';

type Props = {
  readonly value?: string;
  readonly onChange: (value?: string) => void;
  readonly options?: Array<Option<string>>;
};

function EventSelector({ value, onChange, options }: Props) {
  const getEventTitle = useLogEventTitle();
  const defaultEventOptions = Object.keys(logEventTitle).map((value) => ({
    value,
    title: getEventTitle(value),
  }));
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Select
      isSearchEnabled
      isClearable
      value={value}
      options={options ?? defaultEventOptions}
      placeholder={t('logs.event')}
      onChange={onChange}
    />
  );
}

export default EventSelector;
