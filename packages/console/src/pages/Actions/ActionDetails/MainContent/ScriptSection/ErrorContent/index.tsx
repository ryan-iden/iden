import useInterfaceTranslation from '@/hooks/use-interface-translation';

import { type TestResultData } from '../use-test-handler';

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
          {tUi('action_result') + ': \n'}
          {testResult.payload}
        </pre>
      )}
    </div>
  );
}

export default ErrorContent;
