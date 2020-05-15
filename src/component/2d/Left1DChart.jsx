import { xyReduce } from 'ml-spectra-processing';
import React, { useMemo, memo } from 'react';

import { useChartData } from '../context/ChartContext';

import { LAYOUT } from './utilities/DimensionLayout';
import { get1DXScale, get1DYScale } from './utilities/scale';

const Left1DChart = memo(({ margin: marignValue, data }) => {
  const { height: originHeight, margin, yDomain, yDomains } = useChartData();

  const height = margin.left;

  const paths = useMemo(() => {
    if (data) {
      const scaleX = get1DXScale(
        { height: originHeight, yDomain, margin },
        LAYOUT.LEFT_1D,
      );
      const scaleY = get1DYScale(yDomains[data.id], height, marignValue);

      const { x, y } = data;
      const pathPoints = xyReduce(
        { x, y },
        {
          from: yDomain[0],
          to: yDomain[1],
        },
      );
      let path = `M ${scaleX(pathPoints.x[0])} ${scaleY(pathPoints.y[0])} `;
      path += pathPoints.x.slice(1).reduce((accumulator, point, i) => {
        accumulator += ` L ${scaleX(point)} ${scaleY(pathPoints.y[i + 1])}`;
        return accumulator;
      }, '');
      return path;
    } else {
      return null;
    }
  }, [data, height, margin, marignValue, originHeight, yDomain, yDomains]);

  const mainHeight = originHeight - margin.bottom - margin.top;

  if (!mainHeight || !height) return null;

  return (
    <svg
      viewBox={`0 0 ${height} ${mainHeight + margin.top}`}
      width={height}
      height={mainHeight + margin.top}
    >
      <defs>
        <clipPath id="clip-left">
          <rect width={mainHeight} height={height} x={margin.top} y={`${0}`} />
        </clipPath>
      </defs>
      <g
        clipPath="url(#clip-left)"
        style={{
          transform: `rotate(-90deg) translate(-${margin.top}px,-${
            mainHeight + margin.top
          }px)`,
          transformOrigin: `${mainHeight + margin.top}px 0px`,
        }}
      >
        <path className="line" stroke="black" fill="none" d={paths} />
      </g>
    </svg>
  );
});

Left1DChart.defaultProps = {
  margin: 10,
};

export default Left1DChart;
