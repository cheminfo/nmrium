import { useState, useEffect } from 'react';

import NMRium from '../../component/NMRium';

export default function SingleView(props) {
  const [data, setData] = useState<
    { spectra: Array<{ source: { jcampURL: string } }> } | undefined
  >();
  const { path } = props;

  useEffect(() => {
    const _data = {
      spectra: [
        {
          source: {
            jcampURL: path,
          },
        },
      ],
    };

    if (_data) {
      setData(_data);
    } else {
      setData(undefined);
    }
  }, [path, props]);

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
      <NMRium data={data} />
    </div>
  );
}
