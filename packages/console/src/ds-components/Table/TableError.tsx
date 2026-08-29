import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import IdenRequestError from '@/assets/images/iden-states/request-error.png';
import RequestErrorDarkImage from '@/assets/images/request-error-dark.svg?react';
import RequestErrorImage from '@/assets/images/request-error.svg?react';
import { isIdenBrand } from '@/consts/brand';
import useTheme from '@/hooks/use-theme';

import Button from '../Button';

import styles from './TableError.module.scss';

type Props = {
  readonly title?: string;
  readonly content?: string;
  readonly onRetry?: () => void;
  readonly columns: number;
};

function TableError({ title, content, onRetry, columns }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();

  return (
    <tr>
      <td colSpan={columns}>
        <div className={styles.tableError}>
          {isIdenBrand ? (
            <img alt="" src={IdenRequestError} />
          ) : theme === Theme.Light ? (
            <RequestErrorImage />
          ) : (
            <RequestErrorDarkImage />
          )}
          <div className={styles.title}>{title ?? t('errors.something_went_wrong')}</div>
          <div className={styles.content}>{content ?? t('errors.unknown_server_error')}</div>
          {onRetry && <Button title="general.retry" onClick={onRetry} />}
        </div>
      </td>
    </tr>
  );
}

export default TableError;
