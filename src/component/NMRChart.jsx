import React from 'react';

import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import XAxis from './XAxis';
import YAxis from './YAxis';
import { useChartData } from './context/ChartContext';

function NMRChart() {
  const { mode, width, height, margin } = useChartData();
  return (
    <svg width={width} height={height}>
      <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height}`}
            x={`${margin.left}`}
            y={`${margin.top}`}
          />
        </clipPath>
      </defs>

      <LinesSeries />
      <IntegralsSeries />

      <g className="container">
        <XAxis showGrid={true} mode={mode} />
        <YAxis label="PPM" show={false} />
      </g>
    </svg>
  );
}

export default React.forwardRef(NMRChart);
