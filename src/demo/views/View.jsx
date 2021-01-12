import { useState, useEffect, useCallback } from 'react';
import { ObjectInspector } from 'react-inspector';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';

async function loadData(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.json();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

export default function View(props) {
  const [data, setData] = useState();
  const { file, title, baseURL } = props;
  const [logs, setLog] = useState([]);
  const [isLogVisible, showLog] = useState(false);

  useEffect(() => {
    if (file) {
      loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replace(/\.\/+?/g, baseURL));
        setData(_d);
      });
    } else {
      setData({});
    }
  }, [baseURL, file, props]);

  const changeHadnler = useCallback((logData) => {
    setLog((prevLogs) => {
      return prevLogs.concat({
        datetime: new Date().toLocaleTimeString(),
        data: logData,
      });
    });
  }, []);
  const showLogHandler = useCallback(() => {
    showLog((prevflag) => !prevflag);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        marginLeft: 30,
      }}
    >
      <div
        tyle={{
          height: '60px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <h5
          style={{
            fontWeight: 700,
            fontSize: '1.5em',
            lineHeight: '1.4em',
            marginBottom: '15px',
          }}
        >
          Display and process 1D NMR spectra from a jcamp-dx file
        </h5>
        {title && (
          <p
            style={{
              marginTop: '-10px',
              marginBottom: '1rem',
              fontWeight: 400,
              color: '#9a9a9a',
              fontSize: '0.7142em',
            }}
          >
            {title}
          </p>
        )}
        <button
          type="button"
          onClick={showLogHandler}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            backgroundColor: 'white',
            width: '100px',
            fontSize: '12px',
          }}
        >
          {isLogVisible ? 'Hide Logs' : 'Show logs'}
        </button>
      </div>
      <div
        style={{
          height: 'calc(100% - 75px)',
          display: 'flex',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div style={{ width: isLogVisible ? '75%' : '100%' }}>
            <NMRDisplayer data={data} onDataChange={changeHadnler} />
          </div>
          <div
            style={
              isLogVisible
                ? {
                    backgroundColor: 'white',
                    width: '25%',
                    marginLeft: '5px',
                  }
                : { width: 0, display: 'none' }
            }
          >
            <div
              style={{
                backgroundColor: 'lightgray',
                padding: '5px',
                height: '30px',
              }}
            >
              <span>Logs</span>
            </div>
            <div
              style={{
                padding: '5px',
                overflowY: 'scroll',
                height: 'calc(100% - 30px)',
              }}
            >
              {logs.map((log, index) => (
                <div
                  key={`${index + log.datetime}`}
                  style={{ margin: '5px 0' }}
                >
                  <span style={{ fontSize: '12px' }}>{log.datetime}</span>
                  <ObjectInspector data={log.data} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
