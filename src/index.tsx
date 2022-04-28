import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Main from './demo/layouts/Main';
import TestRoutes from './demo/test/TestRoutes';

// Reset styles so they do not affect development of the React component.
import 'modern-normalize/modern-normalize.css';
import './demo/preflight.css';

import './demo/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root element not found');
}

const root = createRoot(rootElement);
root.render(
  <HashRouter>
    <Switch>
      <Route path="/test" component={TestRoutes} />
      <Route path="/" render={(props) => <Main {...props} />} />
    </Switch>
  </HashRouter>,
);
