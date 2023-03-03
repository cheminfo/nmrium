import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { getKey } from '../utility/menu';
import { possibleViews } from '../views';

import { PageConfig } from './Main';

interface SingleDisplayerLayoutProps {
  path: any;
  pageConfig: PageConfig;
}

export default function SingleDisplayerLayout(
  props: SingleDisplayerLayoutProps,
) {
  const viewName = 'SingleView';

  const RenderedView = possibleViews[viewName];

  const { width, height } = props.pageConfig;
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
          marginLeft: 'auto',
          marginRight: 'auto',
          width,
          height,
          backgroundColor: '#ebecf1',
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
