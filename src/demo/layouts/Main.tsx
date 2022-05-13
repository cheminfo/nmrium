import { useEffect, useState, useCallback, CSSProperties } from 'react';

import routes from '../samples.json';

import AdminLayout from './Admin';
import SingleDisplayerLayout from './SingleDisplayerLayout';

const styles: Record<
  | 'bodyContainer'
  | 'container'
  | 'normal'
  | 'error'
  | 'errorHeader'
  | 'normalHeader'
  | 'loadButton',
  CSSProperties
> = {
  bodyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#e3e3e3',
  },
  container: {
    width: '30%',
    height: '40%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    fontSize: '20px',
    textAlign: 'center',
  },
  normal: {
    backgroundColor: 'white',
    color: 'black',
  },
  error: {
    backgroundColor: 'red',
    color: 'white',
  },
  errorHeader: {
    fontSize: '100px',
  },
  normalHeader: {
    fontSize: '24px',
  },
  loadButton: {
    fontSize: '12px',
    padding: '12px 40px',
    borderRadius: '10px',
    border: '1px solid #c70000',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

async function loadData(url) {
  const response = await fetch(url);
  try {
    checkStatus(response);
    const data = await response.json();
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const Main = () => {
  const [data, setRoutes] = useState<{
    isLoaded: boolean;
    status: number;
    routes?: Array<any>;
    baseURL?: string;
    path?: string;
  }>({
    isLoaded: false,
    status: 200,
    routes: [],
  });

  const [dashBoardType, setDashBoardType] = useState('');

  const loadHandler = useCallback(() => {
    setRoutes({ isLoaded: true, status: 200, routes: routes });
  }, []);

  const getFileExtension = (url = '') => {
    return url.substring(url.lastIndexOf('.') + 1);
  };

  const href = window.location.href;
  useEffect(() => {
    const qs = new URL(href).searchParams;
    if (qs.has('sampleURL')) {
      const sampleURL = qs.get('sampleURL') as string;
      const extension = getFileExtension(sampleURL).toLowerCase();
      switch (extension) {
        case 'json': {
          setDashBoardType('multi');
          void loadData(sampleURL).then((remoteRoutes) => {
            if (remoteRoutes) {
              const baseURL = sampleURL.replace(
                /^(?<url>.*[\\/])?(?<filename>.*?\.[^.]*?|)$/g,
                '$1',
              );

              const _remoteRoutes = JSON.parse(
                JSON.stringify(remoteRoutes).replace(/\.\/+?/g, baseURL),
              );
              setRoutes({
                isLoaded: true,
                status: 200,
                routes: _remoteRoutes,
                baseURL,
              });
            } else {
              setRoutes({ isLoaded: false, status: 404, routes: [] });
            }
          });
          break;
        }
        case 'dx':
        case 'jdx': {
          setDashBoardType('single');
          setRoutes({
            isLoaded: true,
            status: 200,
            path: sampleURL,
          });

          break;
        }

        default:
          break;
      }
    } else {
      setDashBoardType('multi');
      setRoutes({ isLoaded: true, status: 200, routes: routes, baseURL: './' });
    }
  }, [href]);

  return !data.isLoaded ? (
    <div style={styles.bodyContainer}>
      <div
        style={{
          ...styles.container,
          ...(data.status === 200 ? styles.normal : styles.error),
        }}
      >
        {data.status === 200 ? (
          <div>
            <p style={styles.normalHeader}>Please wait</p>
            <p>We will redirect you in a minute</p>
          </div>
        ) : (
          <div>
            <p style={styles.errorHeader}>404</p>
            <p>Resource not found.</p>
            <button
              style={styles.loadButton}
              type="button"
              onClick={loadHandler}
            >
              Load local samples
            </button>
          </div>
        )}
      </div>
    </div>
  ) : dashBoardType && dashBoardType === 'single' ? (
    <SingleDisplayerLayout path={data.path} />
  ) : (
    <AdminLayout routes={data.routes} baseURL={data.baseURL} />
  );
};

export default Main;
