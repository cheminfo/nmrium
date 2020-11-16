import { jsx, css } from '@emotion/react';

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
  const { data, tempData } = useChartData();

  const _data = tempData ? tempData : data;

  return (
    <g css={pathStyles} clipPath="url(#clip)">
      {_data &&
        _data
          .filter(
            (d) => d.display.isVisible === true && d.isVisibleInDomain === true,
          )
          .map((d, i) => <Line key={d.id} {...d} index={i} />)}
    </g>
  );
};

export default LinesSeries;
