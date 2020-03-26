import React, { useMemo } from 'react';
import { scaleLinear } from 'd3';
import { XY } from 'ml-spectra-processing';

import { useChartData } from '../context/ChartContext';
// import YAxis from '../1d/YAxis';

const Top1DChart = ({ height, margin: marginProps, data }) => {
  const { width, margin } = useChartData();
  const scaleX = useMemo(() => {
    return scaleLinear(data.xDomain, [width - margin.right, margin.left]);
  }, [data.xDomain, margin.left, margin.right, width]);

  const scaleY = useMemo(() => {
    return scaleLinear(data.yDomain, [
      height - marginProps.bottom,
      marginProps.top,
    ]);
  }, [data.yDomain, height, marginProps.bottom, marginProps.top]);

  const paths = useMemo(() => {
    if (data) {
      const { x, y } = data.spectrum;
      const pathPoints = XY.reduce(
        { x, y },
        {
          from: data.xDomain[0],
          to: data.xDomain[1],
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
  }, [data, scaleX, scaleY]);

  if (!width || !height) {
    return null;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <clipPath id="clip-top">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height}`}
            x={`${margin.left}`}
            y={`${0}`}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#clip-top)">
        <path
          className="line"
          stroke="red"
          fill="none"
          d={paths}
          //   transform={`translate(0,-${vAlign})`}
        />
        {/* <line
          x1={margin.left}
          y1={height}
          x2={width - margin.right}
          y2={height}
          stroke="black"
        /> */}
      </g>
    </svg>
  );
};

Top1DChart.defaultProps = {
  height: 100,
  margin: {
    top: 10,
    bottom: 10,
  },
};

export default Top1DChart;
