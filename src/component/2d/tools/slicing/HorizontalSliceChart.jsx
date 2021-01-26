import { xyReduce } from 'ml-spectra-processing';
import { useMemo, memo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { get2DXScale } from '../../utilities/scale';

import { getYScale } from './SliceScale';

function HorizontalSliceChart({ margin: marginProps, data }) {
  const { width, margin: originMargin, xDomain, displayerKey } = useChartData();

  const height = originMargin.top;

  const paths = useMemo(() => {
    if (data) {
      const { x, re: y } = data;
      const scaleX = get2DXScale({ margin: originMargin, width, xDomain });

      const scaleY = getYScale(height, y, marginProps);
      const pathPoints = xyReduce(
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
  }, [data, height, marginProps, originMargin, width, xDomain]);

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

HorizontalSliceChart.defaultProps = {
  margin: 10,
};

export default memo(HorizontalSliceChart);
