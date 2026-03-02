import type { NmriumState } from '@zakodium/nmrium-core';
import { FileCollection } from 'file-collection';
import { useEffect, useState } from 'react';

import { NMRium } from '../../component/main/index.js';
import { demoCore } from '../utility/core.ts';

interface SingleViewProps {
  path: string;
}
export default function SingleView(props: SingleViewProps) {
  const { path } = props;

  const [data, setData] = useState<{
    state: Partial<NmriumState>;
    aggregator: FileCollection;
  }>();

  useEffect(() => {
    let canceled = false;
    void demoCore
      .readFromWebSource({ entries: [{ relativePath: path }] })
      .then(([state, fileCollection, selectorRoot]) => {
        if (canceled) return;

        const aggregator = new FileCollection().appendFileCollection(
          fileCollection,
          selectorRoot,
        );
        setData({ state, aggregator });
      });

    return () => {
      canceled = true;
    };
  }, [path]);

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
      <NMRium state={data?.state} aggregator={data?.aggregator} />
    </div>
  );
}
