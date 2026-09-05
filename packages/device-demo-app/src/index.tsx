import { createRoot } from 'react-dom/client';

import App from './App';
import initI18n from './i18n/init';
import { applyProductBrandToDocument } from './product-brand';

applyProductBrandToDocument();

const app = document.querySelector('#app');
const root = app && createRoot(app);
const start = async () => {
  await initI18n();
  root?.render(<App />);
};
void start();
