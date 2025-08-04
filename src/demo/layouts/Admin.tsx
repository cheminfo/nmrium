import styled from '@emotion/styled';
import type { ReactElement } from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Sidebar from '../Sidebar.js';
import { getKey, mapTreeToFlatArray } from '../utility/menu.js';
import { possibleViews } from '../views/index.js';

const Container = styled.div<{ isMenuClosed: boolean }>`
  position: relative;
  background-color: #ebecf1;
  float: right;
  height: 100%;
  margin-left: ${({ isMenuClosed }) => (isMenuClosed ? '20px' : '0px')};
  width: ${({ isMenuClosed }) => (isMenuClosed ? '98%' : 'calc(100% - 260px)')};
`;

interface DashboardProps {
  routes?: any[];
  baseURL?: string;
}

export default function Dashboard(props: DashboardProps) {
  const { routes = [], baseURL } = props;
  const routesList = useMemo(() => mapTreeToFlatArray(routes), [routes]);
  const [menuIsClosed, setMenuIsClosed] = useState(false);
  const toggleMenu = useCallback(
    () => setMenuIsClosed(!menuIsClosed),
    [menuIsClosed],
  );

  let rootRoute: ReactElement | null = null;
  if (routesList.length > 0) {
    const route = routesList[0];
    const viewName = route.view || 'View';
    const RenderedView = possibleViews[viewName];
    rootRoute = (
      <Route
        path="/"
        element={
          <RenderedView
            {...{ ...route[0], pageConfig: { width: '100', height: '100' } }}
          />
        }
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
      <Container isMenuClosed={menuIsClosed} className="demo-main-container">
        {/*<StrictMode>*/}
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
        {/*</StrictMode>*/}
      </Container>
    </div>
  );
}

function RenderView(props) {
  const { prop, baseURL } = props;
  const viewName = prop.view || 'View';
  const RenderedView = possibleViews[viewName];
  const { search = '' } = useLocation();
  const qs = new URLSearchParams(search);

  const width = qs.get('width') || '100';
  const height = qs.get('height') || '100';

  return (
    <RenderedView
      {...{ ...prop, pageConfig: { width, height } }}
      id={getKey(prop.file)}
      baseURL={baseURL}
    />
  );
}
