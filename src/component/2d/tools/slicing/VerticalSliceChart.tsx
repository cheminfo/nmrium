import { xyReduce } from 'ml-spectra-processing';
import { useMemo, memo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { get2DYScale } from '../../utilities/scale';

import { getYScale } from './SliceScale';

interface VerticalSliceChartProps {
  margin: number;
  data: {
    x: Array<number>;
    re: Array<number>;
  };
}

function VerticalSliceChart({
  margin: marignValue = 10,
  data,
}: VerticalSliceChartProps) {
  const {
    height: originHeight,
    margin,
    yDomain,
    displayerKey,
  } = useChartData();

  const height = margin.left;

  const paths = useMemo(() => {
    if (data) {
      const { x, re: y } = data;
      const scaleX = get2DYScale({ height: originHeight, margin, yDomain });

      const scaleY = getYScale(height, y, marignValue);

      const pathPoints = xyReduce(
        { x, y },
        {
          from: yDomain[0],
          to: yDomain[1],
        },
      );
      const lastXIndex = pathPoints.x.length - 1;
      const lastYIndex = pathPoints.y.length - 1;
      let path = `M  ${scaleY(pathPoints.y[lastYIndex])} ${scaleX(
        lastXIndex,
      )} `;
      path += pathPoints.x
        .slice(0, lastXIndex)
        .reduceRight((accumulator, point, index) => {
          accumulator += ` L  ${scaleY(pathPoints.y[index])} ${scaleX(point)}`;
          return accumulator;
        }, '');
      return path;
    } else {
      return undefined;
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
        <clipPath id={`${displayerKey}clip-left`}>
          <rect width={height} height={mainHeight} x="0" y={margin.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-left)`}>
        <path className="line" stroke="red" fill="none" d={paths} />
      </g>
    </svg>
  );
}

export default memo(VerticalSliceChart);
