import { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';

const TestHighlight = lazy(() => import('./TestHighlight'));

export default function TestRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/test/highlight" component={TestHighlight} />
        <Route render={() => <div>Page not found</div>} />
      </Switch>
    </Suspense>
  );
}
