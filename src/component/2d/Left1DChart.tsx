import { xyReduce } from 'ml-spectra-processing';
import { useMemo, memo } from 'react';

import { useChartData } from '../context/ChartContext';

import { get1DYScale, get2DYScale } from './utilities/scale';

interface Left1DChartProps {
  margin: number;
  data: {
    id: number;
    data: {
      x: Array<number>;
      y: Array<number>;
    };
  };
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

  const height = margin.left;

  const paths = useMemo(() => {
    if (spectrum) {
      const scaleX = get2DYScale({
        height: originHeight,
        yDomain: [yDomain[0], yDomain[1]],
        margin,
      });
      const scaleY = get1DYScale(yDomains[spectrum.id], height, marignValue);

      const { x, y } = spectrum.data;
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
  }, [height, margin, marignValue, originHeight, spectrum, yDomain, yDomains]);

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
