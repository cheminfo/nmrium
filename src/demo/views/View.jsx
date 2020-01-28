import React, { useState, useEffect } from 'react';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';

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

export default function View(props) {
  const [data, setData] = useState();
  const { file, title } = props;

  useEffect(() => {
    if (file) {
      loadData(file).then((d) => {
        setData(d);
      });
    } else {
      setData({});
    }
  }, [file, props]);

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
      <p className="category">{title}</p>
      <NMRDisplayer data={data} />
    </div>
  );
}
