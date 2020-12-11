import { xyReduce } from 'ml-spectra-processing';
import { useMemo, memo } from 'react';

import { useChartData } from '../../../context/ChartContext';
// import { LAYOUT } from '../utilities/DimensionLayout';
import { get2DYScale } from '../../utilities/scale';

import { getYScale } from './SliceScale';

const VerticalSliceChart = memo(({ margin: marignValue, data }) => {
  const { height: originHeight, margin, yDomain } = useChartData();
  // const { yDomain: sliceYDomain, slicingData } = useSlicing();

  const height = margin.left;

  const paths = useMemo(() => {
    if (data) {
      const { x, re: y } = data;
      const scaleX = get2DYScale({ height: originHeight, margin, yDomain });

      // const { scaleX, xDomain } = getLeftXScale(originHeight, margin, x);
      const scaleY = getYScale(height, y, marignValue);

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
  }, [data, height, margin, marignValue, originHeight, yDomain]);

  const mainHeight = originHeight - margin.bottom - margin.top;

  if (!mainHeight || !height) return null;

  return (
    <svg
      viewBox={`0 0 ${height} ${mainHeight + margin.top}`}
      width={height}
      height={mainHeight + margin.top}
    >
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="5" />
        </filter>

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
        <rect
          width={mainHeight}
          height={height}
          x={margin.top}
          y={`${0}`}
          // fill="rgba(255,255,255,0.8)"
          fillOpacity="0"
          // filter="url(#blur)"
        />

        <path className="line" stroke="red" fill="none" d={paths} />
      </g>
    </svg>
  );
});

VerticalSliceChart.defaultProps = {
  margin: 10,
};

export default VerticalSliceChart;
