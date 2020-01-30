import React, { useState, useEffect } from 'react';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';
import { StructureEditor } from 'react-ocl/full';

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

export default function Exercise(props) {
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
      <div style={{ display: 'flex', height: '60%' }}>
        <div style={{ width: '70%' }}>
          <NMRDisplayer
            data={data}
            preferences={{
              panels: {
                hidePeaksPanel: true,
                hideInformationPanel: true,
                hideRangesPanel: true,
                hideStructuresPanel: true,
                hideFiltersPanel: true,
              },
            }}
          />
        </div>

        <div
          style={{
            height: '100%',
            // border: '1px dashed black',
            width: '30%',
            backgroundColor: '#e9f6ff',

            // flex: '1',
            // display: 'flex',
            // justifyContent: 'center',
            // alignItems: 'center',
          }}
        >
          <StructureEditor svgMenu={true} fragment={false} />
        </div>
      </div>
    </div>
  );
}
