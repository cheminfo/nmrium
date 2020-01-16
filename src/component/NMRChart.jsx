import React from 'react';

import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import XAxis from './XAxis';
import YAxis from './YAxis';
import { useChartData } from './context/ChartContext';
import PeaksNotations from './PeaksNotations';
import Ranges from './Ranges';

function NMRChart() {
  const { mode, width, height, margin } = useChartData();
  if (!width || !height) {
    return null;
  }
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

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid={true} mode={mode} />
        <YAxis label="PPM" show={false} />
      </g>
    </svg>
  );
}

export default React.forwardRef(NMRChart);
