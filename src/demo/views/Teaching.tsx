import { useState, useEffect } from 'react';

import NMRium from '../../component/NMRium';

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

export default function Teaching(props) {
  const [data, setData] = useState<any>();
  const { file, title, baseURL } = props;

  useEffect(() => {
    if (file) {
      void loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replace(/\.\/+?/g, baseURL));
        setData(_d);
      });
    } else {
      setData({});
    }
  }, [baseURL, file, props]);

  return (
    <div
      style={{
        height: '100%',
        marginLeft: 30,
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
      </div>
      <div
        style={{
          height: 'calc(100% - 75px)',
          display: 'flex',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div style={{ width: '100%' }}>
            <NMRium
              data={data}
              preferences={{
                panels: {
                  informationPanel: { display: true },
                  peaksPanel: { display: true },
                  integralsPanel: { display: true },
                  filtersPanel: { display: true },
                  multipleSpectraAnalysisPanel: { display: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
