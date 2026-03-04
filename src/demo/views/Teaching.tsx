import type { CoreReadReturn } from '@zakodium/nmrium-core';
import { useEffect, useState } from 'react';

import { NMRium } from '../../component/main/index.js';
import { demoCore } from '../utility/core.ts';

async function loadData(file: string | URL, baseURL: string) {
  const response = await fetch(file);
  checkStatus(response);
  const nmriumObject = await response.json();

  if (baseURL === './') baseURL = window.location.href;
  return await demoCore.readNMRiumObject(nmriumObject, undefined, { baseURL });
}

function checkStatus(response: any) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

export default function Teaching(props: any) {
  const [data, setData] = useState<CoreReadReturn>();
  const { file, title, baseURL } = props;

  if (!file && data) {
    setData(undefined);
  }

  useEffect(() => {
    if (!file) return;

    void loadData(file, baseURL).then(setData);
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
              state={data?.state}
              aggregator={data?.aggregator}
              preferences={{
                display: {
                  panels: {
                    informationPanel: { display: true, visible: true },
                    peaksPanel: { display: true, visible: true },
                    integralsPanel: { display: true, visible: true },
                    processingsPanel: { display: true, visible: true },
                    multipleSpectraAnalysisPanel: {
                      display: true,
                      visible: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
