import { createRoot } from 'react-dom/client';

import App from './App';
import { applyProductBrandToDocument } from './product-brand';

applyProductBrandToDocument();

const app = document.querySelector('#app');
const root = app && createRoot(app);
root?.render(<App />);
