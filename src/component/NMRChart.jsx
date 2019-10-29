import React from 'react';

import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import XAxis from './XAxis';
import YAxis from './YAxis';
import { useChartData } from './context/ChartContext';
import PeaksNotations from './PeaksNotations';

function NMRChart() {
  const { mode, width, height, margin } = useChartData();
  if (!width || !height) {
    return null;
  }
  return (
    <svg width={width} height={height}>
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

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid={true} mode={mode} />
        <YAxis label="PPM" show={false} />
      </g>
    </svg>
  );
}

export default React.forwardRef(NMRChart);
