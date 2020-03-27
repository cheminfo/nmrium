import { scaleLinear } from 'd3';
import { XY } from 'ml-spectra-processing';
import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

const Left1DChart = ({ height, margin, data }) => {
  const { height: originHeight, margin: originMargin } = useChartData();

  const scaleX = useMemo(() => {
    return scaleLinear(data.xDomain, [
      originHeight - originMargin.bottom,
      originMargin.top,
    ]);
  }, [data.xDomain, originHeight, originMargin.bottom, originMargin.top]);

  const scaleY = useMemo(() => {
    return scaleLinear(data.yDomain, [height - margin.bottom, margin.top]);
  }, [data.yDomain, height, margin.bottom, margin.top]);

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

  const mainHeight = originHeight - originMargin.bottom - originMargin.top;

  if (!mainHeight || !height || !paths || !margin) return null;

  return (
    <svg
      // viewBox={`0 0 ${originWidth} ${height}`}
      width={height}
      height={mainHeight + height}
      // css={styles}
    >
      <defs>
        <clipPath id="clip-left">
          <rect
            // style={{
            //   transform: 'rotate(90deg) scaleY(1)',
            //   transformOrigin: '0px 100px',
            // }}
            width={mainHeight}
            height={height}
            x={height}
            y={`${0}`}
          />
        </clipPath>
      </defs>
      <g
        clipPath="url(#clip-left)"
        style={{
          transform: `rotate(-90deg) translate(-${height}px,-${
            mainHeight + height
          }px)`,
          transformOrigin: `${mainHeight + height}px 0px`,
        }}
      >
        <path className="line" stroke="black" fill="none" d={paths} />
        {/* <line
          x1={originMargin.top}
          y1={height}
          x2={originHeight - originMargin.bottom}
          y2={height}
          stroke="black"
        /> */}
      </g>
    </svg>
  );
};

Left1DChart.defaultProps = {
  height: 100,
  margin: {
    top: 10,
    bottom: 10,
  },
};

export default Left1DChart;
