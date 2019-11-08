import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';
import { Analysis } from '../../data/Analysis';

async function loadData(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.json();
  return Analysis.build(data);
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

export default function View({ file, title, ...otherProps }) {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (file) {
      loadData(file).then((d) => {
        setData(d);
        setIsLoading(false);
      });
    } else {
      Analysis.build().then((obj) => {
        setData(obj);
        setIsLoading(false);
      });
    }
  }, [file]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 30,
      }}
    >
      <h5 className="title">NMR Displayer</h5>
      <p className="category">{title}</p>
      <ClipLoader
        css={{
          position: 'absolute',
          left: 350,
          top: 275,
        }}
        sizeUnit={'px'}
        size={30}
        color={'#2ca8ff'}
        loading={isLoading}
      />
      <NMRDisplayer data={data} {...otherProps} />
    </div>
  );
}
