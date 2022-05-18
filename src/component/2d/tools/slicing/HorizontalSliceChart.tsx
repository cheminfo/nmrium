import { useMemo, memo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import useXYReduce, { XYReducerDomainAxis } from '../../../hooks/useXYReduce';
import { PathBuilder } from '../../../utility/PathBuilder';
import { get2DXScale } from '../../utilities/scale';

import { getYScale } from './SliceScale';

interface HorizontalSliceChartProps {
  margin?: number;
  data: {
    x: Float64Array;
    re: Float64Array;
  };
}

function HorizontalSliceChart({
  margin: marginProps = 10,
  data,
}: HorizontalSliceChartProps) {
  const { width, margin: originMargin, xDomain, displayerKey } = useChartData();
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);

  const height = originMargin.top;

  const paths = useMemo(() => {
    if (data) {
      const { x, re: y } = data;
      const scaleX = get2DXScale({ margin: originMargin, width, xDomain });

      const scaleY = getYScale(height, y, marginProps);
      const pathPoints = xyReduce({ x, y });

      const pathBuilder = new PathBuilder();
      pathBuilder.moveTo(scaleX(pathPoints.x[0]), scaleY(pathPoints.y[0]));
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(scaleX(pathPoints.x[i]), scaleY(pathPoints.y[i]));
      }

      return pathBuilder.toString();
    } else {
      return undefined;
    }
  }, [data, height, marginProps, originMargin, width, xDomain, xyReduce]);

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
        <rect
          width={width - originMargin.left - originMargin.right}
          height={height}
          x={originMargin.left}
          y={`${0}`}
          fillOpacity="0"
        />
        <path className="line" stroke="red" fill="none" d={paths} />
      </g>
    </svg>
  );
}

export default memo(HorizontalSliceChart);
