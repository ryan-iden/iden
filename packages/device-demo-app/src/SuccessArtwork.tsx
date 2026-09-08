import { StateArtwork } from '@iden/ui-foundation/react';

import styles from './App.module.scss';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import { isCloudBuild } from './product-brand';

const SuccessArtwork = ({ isDarkMode }: { readonly isDarkMode: boolean }) =>
  isCloudBuild ? (
    <img className={styles.congratsIcon} src={isDarkMode ? congratsDark : congrats} alt="" />
  ) : (
    <StateArtwork className={styles.congratsIcon} kind="success" />
  );

export default SuccessArtwork;
