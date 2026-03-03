import type { CoreReadReturn } from '@zakodium/nmrium-core';
import { useEffect, useState } from 'react';

import { NMRium } from '../../component/main/index.js';
import { demoCore } from '../utility/core.ts';

const data1 = {
  spectra: [
    {
      data: {},
      source: {
        original: [],
        jcamp: null,
        jcampURL: './data/50-78-2/1h.dx',
      },
      display: {
        name: '1H',
        isVisible: true,
        isPeaksMarkersVisible: true,
        isRealSpectrumVisible: true,
      },
    },
  ],
};
const data2 = {
  spectra: [
    {
      data: {},
      source: {
        original: [],
        jcamp: null,
        jcampURL: './data/ethylbenzene/cosy.jdx',
      },
      display: {
        name: '1H',
        isVisible: true,
        isPeaksMarkersVisible: true,
        isRealSpectrumVisible: true,
      },
    },
  ],
};

export default function TwoInstances(props: any) {
  const { path } = props;
  const [aInstance, setAInstance] = useState<CoreReadReturn>();
  const [bInstance, setBInstance] = useState<CoreReadReturn>();

  useEffect(() => {
    async function readOldInstances() {
      const [ra, rb] = await Promise.all([
        demoCore.readNMRiumObject(data1),
        demoCore.readNMRiumObject(data2),
      ]);

      setAInstance(ra);
      setBInstance(rb);
    }

    void readOldInstances();
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 30,
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
      {path && (
        <p
          style={{
            marginTop: '-10px',
            marginBottom: '1rem',
            fontWeight: 400,
            color: '#9a9a9a',
            fontSize: '0.7142em',
          }}
        >
          {path}
        </p>
      )}
      <div style={{ flex: 1 }}>
        <NMRium
          key="1"
          state={aInstance?.state}
          aggregator={aInstance?.aggregator}
        />
      </div>
      <div style={{ flex: 1 }}>
        <NMRium
          key="2"
          state={bInstance?.state}
          aggregator={bInstance?.aggregator}
        />
      </div>
    </div>
  );
}
