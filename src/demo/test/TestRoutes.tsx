import { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';

import Test from '../views/Test';

const TestHighlight = lazy(() => import('./TestHighlight'));

export default function TestRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/test/highlight" component={TestHighlight} />
        <Route path="/" component={Test} />
        <Route render={() => <div>Page not found</div>} />
      </Switch>
    </Suspense>
  );
}
