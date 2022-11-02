import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Main from './demo/layouts/Main';
import TestHighlight from './demo/test/TestHighlight';
import Test from './demo/views/Test';

// Reset styles so they do not affect development of the React component.
import 'modern-normalize/modern-normalize.css';
import './demo/preflight.css';

import './demo/index.css';

const rootElement = document.querySelector('#root');
if (!rootElement) {
  throw new Error('#root element not found');
}

const root = createRoot(rootElement);
root.render(
  <HashRouter>
    <Routes>
      <Route path="test">
        <Route path="" element={<Test />} />
        <Route path="highlight" element={<TestHighlight />} />
      </Route>
      <Route path="*" element={<Main />} />
    </Routes>
  </HashRouter>,
);
