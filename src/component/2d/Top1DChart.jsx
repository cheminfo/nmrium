import { scaleLinear } from 'd3';
import { XY } from 'ml-spectra-processing';
import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
// import YAxis from '../1d/YAxis';

const Top1DChart = ({ margin: marginProps, data }) => {
  const { width, margin: originMargin, xDomain, yDomains } = useChartData();

  const height = originMargin.top;

  const scaleX = useMemo(() => {
    return scaleLinear(xDomain, [
      width - originMargin.right,
      originMargin.left,
    ]);
  }, [xDomain, originMargin.left, originMargin.right, width]);

  const scaleY = useMemo(() => {
    return scaleLinear(yDomains[data.id], [
      height - marginProps.bottom,
      marginProps.top,
    ]);
  }, [data.id, height, marginProps.bottom, marginProps.top, yDomains]);

  const paths = useMemo(() => {
    if (data) {
      const { x, y } = data;
      const pathPoints = XY.reduce(
        { x, y },
        {
          from: xDomain[0],
          to: xDomain[1],
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
  }, [data, scaleX, scaleY, xDomain]);

  if (!width || !height) {
    return null;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <clipPath id="clip-top">
          <rect
            width={width - originMargin.left - originMargin.right}
            height={height}
            x={originMargin.left}
            y={`${0}`}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#clip-top)">
        <path className="line" stroke="red" fill="none" d={paths} />
      </g>
    </svg>
  );
};

Top1DChart.defaultProps = {
  margin: {
    top: 10,
    bottom: 10,
  },
};

export default Top1DChart;
