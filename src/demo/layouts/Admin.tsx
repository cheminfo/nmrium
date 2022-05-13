/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Suspense, useMemo, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';

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

interface DashboardProps {
  routes?: any[];
  baseURL?: string;
}

export function Dashboard(props: DashboardProps) {
  const { routes = [], baseURL } = props;
  const routesList = useMemo(() => mapTreeToFlatArray(routes), [routes]);
  const [menuIsClosed, setMenuIsClosed] = useState(false);
  const toggleMenu = useCallback(
    () => setMenuIsClosed(!menuIsClosed),
    [menuIsClosed],
  );

  let rootRoute: JSX.Element | null = null;
  if (routesList.length > 0) {
    const route = routesList[0];
    const viewName = route.view ? route.view : 'View';
    const RenderedView = possibleViews[viewName];
    rootRoute = (
      <Route
        path="/"
        element={<RenderedView {...route[0]} />}
        key={getKey(routesList[0].file)}
      />
    );
  }

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
        {/* <StrictMode> */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {routesList.map((prop) => {
              return (
                <Route
                  path={`/SamplesDashboard/:id/${
                    (prop.view || 'View') + getKey(prop.file)
                  }`}
                  element={<RenderView prop={prop} baseURL={baseURL} />}
                  key={getKey(prop.file)}
                />
              );
            })}

            {rootRoute}
          </Routes>
        </Suspense>
        {/* </StrictMode> */}
      </div>
    </div>
  );
}

function RenderView(props) {
  const { prop, baseURL } = props;
  const viewName = prop.view ? prop.view : 'View';
  const RenderedView = possibleViews[viewName];
  return <RenderedView {...prop} id={getKey(prop.file)} baseURL={baseURL} />;
}

export default Dashboard;
