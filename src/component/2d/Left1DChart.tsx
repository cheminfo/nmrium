import { useMemo, memo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';
import { PathBuilder } from '../utility/PathBuilder';

import { get1DYScale, get2DYScale } from './utilities/scale';

interface Left1DChartProps {
  margin?: number;
  data: Datum1D;
}

function Left1DChart({
  margin: marignValue = 10,
  data: spectrum,
}: Left1DChartProps) {
  const {
    height: originHeight,
    margin,
    yDomain,
    yDomains,
    displayerKey,
  } = useChartData();
  const xyReduce = useXYReduce(XYReducerDomainAxis.YAxis);

  const height = margin.left;

  const paths = useMemo(() => {
    if (spectrum) {
      const scaleX = get2DYScale({
        height: originHeight,
        yDomain: [yDomain[0], yDomain[1]],
        margin,
      });
      const scaleY = get1DYScale(yDomains[spectrum.id], height, marignValue);

      const { x, re: y } = spectrum.data;
      const pathPoints = xyReduce({ x, y });

      const lastXIndex = pathPoints.x.length - 1;
      const lastYIndex = pathPoints.y.length - 1;

      const pathBuilder = new PathBuilder();
      pathBuilder.moveTo(scaleY(pathPoints.y[lastYIndex]), scaleX(lastXIndex));

      for (let i = pathPoints.x.length - 2; i > 0; i--) {
        pathBuilder.lineTo(scaleY(pathPoints.y[i]), scaleX(pathPoints.x[i]));
      }

      return pathBuilder.toString();
    } else {
      return undefined;
    }
  }, [
    height,
    margin,
    marignValue,
    originHeight,
    spectrum,
    xyReduce,
    yDomain,
    yDomains,
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
        <path className="line" stroke="black" fill="none" d={paths} />
      </g>
    </svg>
  );
}

export default memo(Left1DChart);
