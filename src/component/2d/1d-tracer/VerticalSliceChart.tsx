import { useMemo, memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import useXYReduce, { XYReducerDomainAxis } from '../../hooks/useXYReduce';
import { PathBuilder } from '../../utility/PathBuilder';
import { getYScale } from '../utilities/SliceScale';
import { get2DYScale } from '../utilities/scale';

interface VerticalSliceChartProps {
  margin?: number;
  data: {
    x: Float64Array;
    re: Float64Array;
  };
  reverseScale?: boolean;
}

function VerticalSliceChart({
  margin: marignValue = 10,
  data,
  reverseScale = false,
}: VerticalSliceChartProps) {
  const {
    height: originHeight,
    margin,
    yDomain,
    displayerKey,
  } = useChartData();
  const xyReduce = useXYReduce(XYReducerDomainAxis.YAxis);

  const height = margin.left;

  const paths = useMemo(() => {
    if (data) {
      const { x, re: y } = data;
      const scaleX = get2DYScale(
        { height: originHeight, margin, yDomain },
        reverseScale,
      );

      const scaleY = getYScale(height, y, marignValue);

      const pathPoints = xyReduce({ x, y });

      const pathBuilder = new PathBuilder();

      pathBuilder.moveTo(
        scaleY(pathPoints.y[pathPoints.y.length - 1]),
        scaleX(pathPoints.x.length - 1),
      );

      for (let i = pathPoints.x.length - 2; i >= 0; i--) {
        pathBuilder.lineTo(scaleY(pathPoints.y[i]), scaleX(pathPoints.x[i]));
      }

      return pathBuilder.toString();
    } else {
      return undefined;
    }
  }, [
    data,
    height,
    margin,
    marignValue,
    originHeight,
    reverseScale,
    xyReduce,
    yDomain,
  ]);

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
