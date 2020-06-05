import React from 'react';

import { useScale } from '../context/ScaleContext';

import BaseLineZones from './BaseLineZones';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
// import YAxis from './YAxis';
import PeaksNotations from './PeaksNotations';
import Ranges from './Ranges';
import XAxis from './XAxis';

function Chart1D({ mode, width, height, margin }) {
  const { scaleX, scaleY } = useScale();
  // console.log(scaleState);
  if (!scaleX || !scaleY || !width || !height) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
    >
      <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height}`}
            x={`${margin.left}`}
            y={`${0}`}
          />
        </clipPath>
      </defs>

      <LinesSeries />
      <IntegralsSeries />
      <PeaksNotations />
      <Ranges />
      <BaseLineZones />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid={true} mode={mode} />
        {/* <YAxis label="PPM" show={false} /> */}
      </g>
    </svg>
  );
}

export default Chart1D;
