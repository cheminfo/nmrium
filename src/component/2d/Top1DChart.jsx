import { xyReduce } from 'ml-spectra-processing';
import { useMemo, memo } from 'react';

import { useChartData } from '../context/ChartContext';

import { get1DYScale, get2DXScale } from './utilities/scale';

function Top1DChart({ margin: marginProps, data }) {
  const { width, margin: originMargin, xDomain, yDomains } = useChartData();

  const height = originMargin.top;

  const paths = useMemo(() => {
    if (data) {
      const scaleX = get2DXScale({ width, xDomain, margin: originMargin });

      const scaleY = get1DYScale(yDomains[data.id], height, marginProps);

      const { x, y } = data;
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
  }, [data, height, marginProps, originMargin, width, xDomain, yDomains]);

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

Top1DChart.defaultProps = {
  margin: 10,
};

export default memo(Top1DChart);
