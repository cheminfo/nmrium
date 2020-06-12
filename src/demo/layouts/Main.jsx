import queryString from 'query-string';
import React, { useEffect, useState, useCallback } from 'react';

import routes from '../samples';

import AdminLayout from './Admin.jsx';
import SingleDisplayerLayout from './SingleDisplayerLayout.jsx';

const styles = {
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
    console.log(e);
    return null;
  }
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const Main = (props) => {
  const [data, setRoutes] = useState({
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

  useEffect(() => {
    const values = queryString.parse(props.location.search);
    if (values && values.sampleURL) {
      const extention = getFileExtension(values.sampleURL).toLowerCase();
      switch (extention) {
        case 'json': {
          setDashBoardType('multi');
          loadData(values.sampleURL).then((remoteRoutes) => {
            if (remoteRoutes) {
              const baseURL = values.sampleURL.replace(
                // eslint-disable-next-line no-useless-escape
                /^(?<url>.*[\\\/])?(?<filename>.*?\.[^.]*?|)$/g,
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
            path: values.sampleURL,
          });

          break;
        }

        default:
          break;
      }

      //   console.log(remoteRoutes);
    } else {
      setDashBoardType('multi');
      setRoutes({ isLoaded: true, status: 200, routes: routes, baseURL: './' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <SingleDisplayerLayout {...props} path={data.path} />
  ) : (
    <AdminLayout {...props} routes={data.routes} baseURL={data.baseURL} />
  );
};

export default Main;
