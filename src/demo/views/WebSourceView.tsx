import { readFromWebSource, CustomWorkspaces } from 'nmr-load-save';
import { useState, useEffect, useCallback } from 'react';
import { ObjectInspector } from 'react-inspector';

import { NMRium, NMRiumWorkspace } from '../../component/main';
import { PageConfig } from '../layouts/Main';

async function loadFromURL(url: string) {
  const { pathname: relativePath, origin: baseURL } = new URL(url);
  return readFromWebSource({ entries: [{ relativePath, baseURL }] });
}

interface WebSourceViewProps {
  file: string;
  title?: string;
  baseURL: string;
  workspace?: NMRiumWorkspace;
  customWorkspaces?: CustomWorkspaces;
  pageConfig: PageConfig;
}

export default function WebSourceView(props: WebSourceViewProps) {
  const [data, setData] = useState();

  const {
    file,
    title,
    baseURL,
    workspace,
    customWorkspaces,
    pageConfig: { width, height },
  } = props;

  const [callbackData, setCallbackData] = useState<any[]>([]);
  const [isCallbackVisible, showCallback] = useState(false);

  useEffect(() => {
    void loadFromURL(file).then((d) => {
      setData(d as any);
    });
  }, [baseURL, file, props]);

  const changeHandler = useCallback((logData) => {
    setCallbackData((prevLogs) => {
      return prevLogs.concat({
        datetime: new Date().toLocaleTimeString(),
        data: logData,
      });
    });
  }, []);

  const showCallbackHandler = useCallback(() => {
    showCallback((prevFlag) => !prevFlag);
  }, []);

  const clearHandler = useCallback(() => {
    setCallbackData([]);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        paddingLeft: 30,
        ...((width !== '100' || height !== '100') && {
          backgroundColor: 'white',
        }),
      }}
    >
      <div
        style={{
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
          Display and process 1D NMR spectra from a JCAMP-DX file
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
        {process.env.NODE_ENV !== 'production' && (
          <button
            type="button"
            onClick={showCallbackHandler}
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              backgroundColor: 'white',
              width: '100px',
              fontSize: '12px',
            }}
          >
            {isCallbackVisible ? 'Hide callback ' : 'Show callback '}
          </button>
        )}
      </div>
      <div
        style={{
          height: height.endsWith('px') ? height : `calc(${height}% - 75px)`,
          display: 'flex',
          width: height.endsWith('px') ? width : `${width}%`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div style={{ width: isCallbackVisible ? '75%' : '100%' }}>
            <NMRium
              data={data}
              onChange={changeHandler}
              {...(workspace && { workspace })}
              {...(customWorkspaces && { customWorkspaces })}
            />
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <div
              style={
                isCallbackVisible
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
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Callback</span>
                <button
                  type="button"
                  onClick={clearHandler}
                  style={{
                    backgroundColor: 'white',
                    width: '50px',
                    fontSize: '12px',
                  }}
                >
                  Clear
                </button>
              </div>
              <div
                style={{
                  padding: '5px',
                  overflowY: 'scroll',
                  height: 'calc(100% - 30px)',
                }}
              >
                {callbackData.map((log, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
