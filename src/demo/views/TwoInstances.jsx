/** @jsxImportSource @emotion/react */

import NMRium from '../../component/NMRium';

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

export default function TwoInstances(props) {
  const { path } = props;

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
        <NMRium data={data1} key="1" />
      </div>
      <div style={{ flex: 1 }}>
        <NMRium data={data2} key="2" />
      </div>
    </div>
  );
}
