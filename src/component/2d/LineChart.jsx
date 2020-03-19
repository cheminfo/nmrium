import React from 'react';

import LinesSeries from '../1d/LinesSeries';
import XAxis from '../1d/XAxis';
// import YAxis from '../1d/YAxis';

function Chart2D({ mode, width, height, margin }) {
  if (!width || !height) {
    return null;
  }

  height = (height / 12) * 3;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="red"
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
      {/* <text>sss</text> */}
      <LinesSeries />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid={true} mode={mode} height={height} />
      </g>
    </svg>
  );
}

export default React.forwardRef(Chart2D);
