import { useMemo, memo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';

import { get1DYScale, get2DXScale } from './utilities/scale';

interface Top1DChartProps {
  margin?: number;
  data: Datum1D;
}

function Top1DChart({
  margin: marginProps = 10,
  data: spectrum,
}: Top1DChartProps) {
  const {
    width,
    margin: originMargin,
    xDomain,
    yDomains,
    displayerKey,
  } = useChartData();
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const height = originMargin.top;

  const paths = useMemo(() => {
    if (spectrum) {
      const scaleX = get2DXScale({ width, xDomain, margin: originMargin });

      const scaleY = get1DYScale(yDomains[spectrum.id], height, marginProps);
      const { x, re: y } = spectrum.data;
      const pathPoints = xyReduce({ x, y });

      // TODO: use d3-path and remove type assertion.
      let path = `M ${scaleX(pathPoints.x[0])} ${scaleY(pathPoints.y[0])} `;
      path += (pathPoints.x.slice(1) as number[]).reduce(
        (accumulator, point, i) => {
          accumulator += ` L ${scaleX(point)} ${scaleY(pathPoints.y[i + 1])}`;
          return accumulator;
        },
        '',
      );
      return path;
    } else {
      return undefined;
    }
  }, [
    height,
    marginProps,
    originMargin,
    spectrum,
    width,
    xDomain,
    xyReduce,
    yDomains,
  ]);

  if (!width || !height) {
    return null;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <clipPath id={`${displayerKey}clip-top`}>
          <rect
            width={width - originMargin.left - originMargin.right}
            height={height}
            x={originMargin.left}
            y={`${0}`}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-top)`}>
        <path
          className="line"
          stroke="red"
          fill="none"
          strokeWidth="1px"
          d={paths}
        />
      </g>
    </svg>
  );
}

export default memo(Top1DChart);
