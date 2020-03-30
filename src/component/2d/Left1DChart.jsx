import { scaleLinear } from 'd3';
import { XY } from 'ml-spectra-processing';
import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

const Left1DChart = ({ margin, data }) => {
  const {
    height: originHeight,
    margin: originMargin,
    yDomain,
    yDomains,
  } = useChartData();
  const height = originMargin.left;

  const scaleX = useMemo(() => {
    return scaleLinear(yDomain, [
      originHeight - originMargin.bottom,
      originMargin.top,
    ]);
  }, [yDomain, originHeight, originMargin.bottom, originMargin.top]);

  const scaleY = useMemo(() => {
    return scaleLinear(yDomains[data.id], [height - margin.bottom, margin.top]);
  }, [data.id, height, margin.bottom, margin.top, yDomains]);

  const paths = useMemo(() => {
    if (data) {
      const { x, y } = data;
      const pathPoints = XY.reduce(
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
  }, [data, scaleX, scaleY, yDomain]);

  const mainHeight = originHeight - originMargin.bottom - originMargin.top;

  if (!mainHeight || !height || !paths || !margin) return null;

  return (
    <svg
      viewBox={`0 0 ${height} ${mainHeight + originMargin.top}`}
      width={height}
      height={mainHeight + originMargin.top}
    >
      <defs>
        <clipPath id="clip-left">
          <rect
            width={mainHeight}
            height={height}
            x={originMargin.top}
            y={`${0}`}
          />
        </clipPath>
      </defs>
      <g
        clipPath="url(#clip-left)"
        style={{
          transform: `rotate(-90deg) translate(-${
            originMargin.top
          }px,-${mainHeight + originMargin.top}px)`,
          transformOrigin: `${mainHeight + originMargin.top}px 0px`,
        }}
      >
        <path className="line" stroke="black" fill="none" d={paths} />
      </g>
    </svg>
  );
};

Left1DChart.defaultProps = {
  margin: {
    top: 10,
    bottom: 10,
  },
};

export default Left1DChart;
