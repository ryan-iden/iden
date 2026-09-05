import useInterfaceTranslation from '@/hooks/use-interface-translation';
import { type TestResultData } from '@/pages/CustomizeJwtDetails/MainContent/ScriptSection/use-test-handler';

import styles from './index.module.scss';

type Props = {
  readonly testResult: TestResultData;
};

function ErrorContent({ testResult }: Props) {
  const { t: tUi } = useInterfaceTranslation();
  return (
    <div>
      {testResult.error && (
        <pre className={styles.error}>
          {tUi('error') + ': \n'}
          {testResult.error}
        </pre>
      )}
      {testResult.payload && (
        <pre>
          {tUi('jwt_extra_claims') + ': \n'}
          {testResult.payload}
        </pre>
      )}
    </div>
  );
}

export default ErrorContent;
