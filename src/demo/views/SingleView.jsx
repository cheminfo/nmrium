import React, { useState, useEffect } from 'react';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';

export default function SingleView(props) {
  const [data, setData] = useState();
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
      setData({});
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
      <h5 className="title">
        Display and process 1D NMR spectra from a jcamp-dx file
      </h5>
      <p className="category">{path}</p>
      <NMRDisplayer data={data} />
    </div>
  );
}
