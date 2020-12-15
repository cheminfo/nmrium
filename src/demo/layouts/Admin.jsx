/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Suspense, StrictMode, useMemo, useState, useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';

import Sidebar from '../Sidebar';
import { mapTreeToFlatArray, getKey } from '../utility/menu';
import { possibleViews } from '../views';

const mainPanelCss = css`
  position: relative;
  float: right;
  height: 100%;
  background-color: #ebecf1;
`;

const mainPanelOpenCss = css`
  width: calc(100% - 260px);
`;

const mainPanelClosedCss = css`
  width: 98%;
  margin-left: 20px !important;
`;

export function Dashboard(props) {
  const { routes = [], baseURL } = props;
  const routesList = useMemo(() => mapTreeToFlatArray(routes), [routes]);
  const [menuIsClosed, setMenuIsClosed] = useState(false);
  const toggleMenu = useCallback(() => setMenuIsClosed(!menuIsClosed), [
    menuIsClosed,
  ]);

  return (
    <div
      style={{
        position: 'relative',
        top: 0,
        height: '100vh',
      }}
    >
      <Sidebar
        {...props}
        routes={routes}
        menuIsClosed={menuIsClosed}
        onMenuToggle={toggleMenu}
      />
      <div
        css={css(
          mainPanelCss,
          menuIsClosed ? mainPanelClosedCss : mainPanelOpenCss,
        )}
      >
        <StrictMode>
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              {routesList.map((prop) => {
                return (
                  <Route
                    path={`/SamplesDashboard/:id/${
                      prop.view + getKey(prop.file)
                    }`}
                    render={(props) => (
                      <RenderView {...props} prop={prop} baseURL={baseURL} />
                    )}
                    key={getKey(prop.file)}
                  />
                );
              })}

              {routesList.length > 0 && (
                <Route
                  path="/"
                  render={() => {
                    const routeProp = routesList[0];
                    const viewName = routeProp.view ? routeProp.view : 'View';
                    const RenderedView = possibleViews[viewName];
                    return <RenderedView {...routeProp[0]} />;
                  }}
                  key={getKey(routesList[0].file)}
                />
              )}
            </Switch>
          </Suspense>
        </StrictMode>
      </div>
    </div>
  );
}

function RenderView(props) {
  const {
    match: {
      params: { id },
    },
    prop,
    baseURL,
  } = props;
  const viewName = prop.view ? prop.view : 'View';
  const RenderedView = possibleViews[viewName];
  return (
    <RenderedView key={id} {...prop} id={getKey(prop.file)} baseURL={baseURL} />
  );
}

export default Dashboard;
