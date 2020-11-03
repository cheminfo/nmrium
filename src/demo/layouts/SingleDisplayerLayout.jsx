import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { getKey } from '../utility/menu';

class SingleDisplayerLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  // eslint-disable-next-line no-empty-function
  componentDidMount() {}

  // eslint-disable-next-line no-empty-function
  componentWillUnmount() {}

  render() {
    return (
      <div className="wrapper">
        <div className="main-panel main-panel-when-menu-closed">
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
                  const RenderedView = React.lazy(() =>
                    import(`../views/${viewName}`),
                  );

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
