import { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { getKey } from '../utility/menu';
import { possibleViews } from '../views';

interface SingleDisplayerLayoutProps {
  view: any;
  patrh: any;
  path: any;
}

export default function SingleDisplayerLayout(
  props: SingleDisplayerLayoutProps,
) {
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
          <Switch>
            <Route
              path="/"
              render={(routeProps: any) => {
                const {
                  match: {
                    params: { id },
                  },
                } = routeProps;
                const viewName = props.view ? props.view : 'SingleView';

                const RenderedView = possibleViews[viewName];

                return (
                  <RenderedView key={id} {...props} id={getKey(props.patrh)} />
                );
              }}
              key={getKey(props.path)}
            />
          </Switch>
        </Suspense>
      </div>
    </div>
  );
}
