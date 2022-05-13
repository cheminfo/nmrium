import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { getKey } from '../utility/menu';
import { possibleViews } from '../views';

interface SingleDisplayerLayoutProps {
  path: any;
}

export default function SingleDisplayerLayout(
  props: SingleDisplayerLayoutProps,
) {
  const viewName = 'SingleView';

  const RenderedView = possibleViews[viewName];
  return (
    <div
      style={{
        position: 'relative',
        top: 0,
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          display: 'block',
          width: '99%',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: '100%',
          backgroundColor: 'ebecf1',
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route
              path="/"
              element={<RenderedView {...props} />}
              key={getKey(props.path)}
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
