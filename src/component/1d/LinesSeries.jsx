import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';

import Line from './Line';

/** @jsx jsx */

const pathStyles = css`
  -webkit-clip-path: url('#clip');
  clip-path: url('#clip');

  path {
    stroke-width: 1.5;
    fill: none;
    // stroke-linejoin: round;
    // stroke-linecap: round;
    // will-change: transform;
  }
`;

export const LinesSeries = () => {
  const { data } = useChartData();

  return (
    <g css={pathStyles} clipPath="url(#clip)">
      {data &&
        data
          .filter((d) => d.isVisible === true && d.isVisibleInDomain === true)
          .map((d, i) => <Line key={d.id} {...d} index={i} />)}
    </g>
  );
};

export default LinesSeries;
