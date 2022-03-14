import { DropZone } from 'analysis-ui-components';
import debounce from 'lodash/debounce';
import { useState, useEffect, useCallback } from 'react';
import { ObjectInspector } from 'react-inspector';

import NMRium from '../../component/NMRium';
import { loadFiles } from '../../component/utility/FileUtility';

function searchDeep(obj, searchKey) {
  let result: any = [];
  function objectHelper(obj) {
    Object.keys(obj).forEach((key) => {
      if (searchKey === key) {
        result.push({ [key]: obj[key] });
      }
      if (Array.isArray(obj[key])) {
        obj[key].forEach((object) => {
          objectHelper(object);
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        objectHelper(obj[key]);
      }
    });
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

export default function Test() {
  const [data, setData] = useState<any>();
  const [callBackData, setCallBackData] = useState<any>({});

  const dropFileHandler = useCallback(async (dropfiles) => {
    try {
      const files = await loadFiles<{ binary: any }>(dropfiles, {
        asBuffer: true,
      });

      const decoder = new TextDecoder('utf8');
      const data = JSON.parse(decoder.decode(files[0].binary));
      setData(data);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Invalid JSON file');
    }
  }, []);
  const dataChangeHandler = useCallback((data) => {
    setCallBackData(data);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <div style={{ flex: 9 }}>
        <NMRium data={data} onDataChange={dataChangeHandler} />
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
          <Inspector data={callBackData} />
        </div>
      </div>
    </div>
  );
}
