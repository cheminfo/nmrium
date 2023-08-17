import debounce from 'lodash/debounce';
import { useState, useEffect, useCallback, useReducer } from 'react';
import { ObjectInspector } from 'react-inspector';
import { DropZone } from 'react-science/ui';

import { NMRium } from '../../component/main';

import { loadData } from './View';

function searchDeep(obj, searchKey) {
  const result: any = [];
  function objectHelper(obj) {
    for (const key in obj) {
      if (searchKey === key) {
        result.push({ [key]: obj[key] });
      }
      if (Array.isArray(obj[key])) {
        for (const object of obj[key]) {
          objectHelper(object);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        objectHelper(obj[key]);
      }
    }
  }

  objectHelper(obj);
  return result;
}

function Inspector(data: any) {
  const [filteredData, seData] = useState<any>();
  const [key, setKey] = useState<string>('');
  useEffect(() => {
    const result = searchDeep(data, key);
    seData(key ? result : data);
  }, [data, key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((e) => {
      const key = e.target.value;
      setKey(key);
    }, 500),
    [data],
  );

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px' }}
    >
      <input
        style={{ border: '1px solid gray', padding: '5px' }}
        type="text"
        placeholder="Search for key..."
        onChange={handleSearch}
      />
      <ObjectInspector data={filteredData} />;
    </div>
  );
}

export default function Test(props) {
  const { file, title, baseURL, workspace } = props;
  const [data, setData] = useState<any>();
  const [viewCount, incrementViewCount] = useReducer((a) => a + 1, 0);
  const [dataCount, incrementDataCount] = useReducer((a) => a + 1, 0);
  const [settingsCount, incrementSettingsCount] = useReducer((a) => a + 1, 0);
  useEffect(() => {
    if (file) {
      void loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replaceAll(/\.\/+?/g, baseURL));
        setData(_d);
      });
    } else {
      setData(undefined);
    }
  }, [baseURL, file, props]);
  const [viewCallBack, setViewCallBack] = useState<any>({});
  const [dataCallBack, setDataCallBack] = useState<any>({});
  const [settingsCallBack, setSettingsCallBack] = useState<any>({});
  const dropFileHandler = useCallback((dropFiles: File[]) => {
    void (async () => {
      try {
        const arrayBuffer = await dropFiles[0].arrayBuffer();
        const decoder = new TextDecoder('utf8');
        const data = JSON.parse(decoder.decode(arrayBuffer));
        setData(data);
      } catch (error) {
        reportError(error);
        // eslint-disable-next-line no-alert
        alert('Invalid JSON file');
      }
    })();
  }, []);

  const changeHandler = useCallback(({ data, view, settings }, source) => {
    switch (source) {
      case 'view': {
        incrementViewCount();
        setViewCallBack({ activate: true, data: view });
        setTimeout(() => {
          setViewCallBack(({ data }) => ({ data, activate: false }));
        }, 500);
        break;
      }
      case 'data': {
        incrementDataCount();
        setDataCallBack({ activate: true, data });
        setTimeout(() => {
          setDataCallBack(({ data }) => ({ data, activate: false }));
        }, 500);
        break;
      }
      case 'settings': {
        incrementSettingsCount();
        setSettingsCallBack({ activate: true, data: settings });
        setTimeout(() => {
          setSettingsCallBack(({ data }) => ({ data, activate: false }));
        }, 500);
        break;
      }
      default:
        break;
    }
  }, []);

  return (
    <div
      style={{
        height: '100%',
        marginLeft: 30,
      }}
    >
      {file && (
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
        </div>
      )}
      <div
        style={{
          display: 'flex',
          minHeight: file ? '90vh' : '100vh',
          padding: file ? '' : '20px 0',
        }}
      >
        <div style={{ flex: 9 }}>
          <NMRium
            data={data}
            onChange={changeHandler}
            workspace={workspace || null}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            flex: 3,
          }}
        >
          <div style={{ flex: 3 }}>
            <DropZone onDrop={dropFileHandler} color="gray" />
          </div>
          <div style={{ flex: 9 }}>
            <h3
              style={
                dataCallBack.activate
                  ? { color: 'red', fontWeight: 'bold' }
                  : {}
              }
            >
              <span data-testid="data-count">{dataCount}</span> - Data Change:
            </h3>
            <Inspector data={dataCallBack.data} />
            <h3
              style={
                viewCallBack.activate
                  ? { color: 'red', fontWeight: 'bold' }
                  : {}
              }
            >
              <span data-testid="view-count">{viewCount}</span> - View Change:
            </h3>
            <Inspector data={viewCallBack.data} />
            <h3
              style={
                settingsCallBack.activate
                  ? { color: 'red', fontWeight: 'bold' }
                  : {}
              }
            >
              <span data-testid="settings-count">{settingsCount}</span> -
              Settings Change:
            </h3>
            <Inspector data={settingsCallBack.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
