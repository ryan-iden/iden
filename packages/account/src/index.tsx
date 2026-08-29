import { applyProductBrandToDocument } from '@experience/shared/utils/product-brand';
import { createRoot } from 'react-dom/client';
import ReactModal from 'react-modal';

import App from './App';

applyProductBrandToDocument();

const app = document.querySelector<HTMLElement>('#app');

if (app) {
  ReactModal.setAppElement(app);
}

const root = app && createRoot(app);
root?.render(<App />);
