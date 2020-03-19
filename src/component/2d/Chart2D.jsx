import React from 'react';

import LineChart from './LineChart';

function Chart2D(props) {
  const { width, height, margin } = props;
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
      {/* <text>sss</text> */}
      <LineChart {...props} />
    </svg>
  );
}

export default React.forwardRef(Chart2D);
