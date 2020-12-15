import { Suspense, PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';

import { getKey } from '../utility/menu';
import { possibleViews } from '../views';

class SingleDisplayerLayout extends PureComponent {
  render() {
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
            position: 'relative',
            float: 'right',
            width: '98% !important',
            marginLeft: '20px !important',
            height: '100%',
            backgroundColor: 'ebecf1',
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route
                path="/"
                render={(props) => {
                  const {
                    match: {
                      params: { id },
                    },
                  } = props;
                  const viewName = this.props.view
                    ? this.props.view
                    : 'SingleView';
                  const RenderedView = possibleViews[viewName];

                  return (
                    <RenderedView
                      key={id}
                      {...this.props}
                      id={getKey(this.props.patrh)}
                    />
                  );
                }}
                key={getKey(this.props.path)}
              />
            </Switch>
          </Suspense>
        </div>
      </div>
    );
  }
}

export default SingleDisplayerLayout;
