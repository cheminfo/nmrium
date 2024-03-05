import { Spectrum1D } from 'nmr-load-save';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import useXYReduce, { XYReducerDomainAxis } from '../../hooks/useXYReduce';
import { PathBuilder } from '../../utility/PathBuilder';
import { use1DTraceYScale, useScale2DX } from '../utilities/scale';

interface Top1DChartProps {
  verticalMargin?: number;
  data: Spectrum1D;
}

interface UsePathOptions {
  verticalMargin?: number;
  height: number;
}

function usePath(spectrum: Spectrum1D, options: UsePathOptions) {
  const { height, verticalMargin = 10 } = options;
  const scaleX = useScale2DX();
  const scaleY = use1DTraceYScale(spectrum.id, height, verticalMargin);
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);

  const { x, re: y } = spectrum.data;
  const pathPoints = xyReduce({ x, y });

  const pathBuilder = new PathBuilder();
  pathBuilder.moveTo(scaleX(pathPoints.x[0]), scaleY(pathPoints.y[0]));
  for (let i = 1; i < pathPoints.x.length; i++) {
    pathBuilder.lineTo(scaleX(pathPoints.x[i]), scaleY(pathPoints.y[i]));
  }

  return pathBuilder.toString();
}

function Top1DChart({ verticalMargin = 10, data: spectrum }: Top1DChartProps) {
  const { width, margin, displayerKey } = useChartData();
  const height = margin.top;

  const path = usePath(spectrum, { height, verticalMargin });

  if (!width || !height) {
    return null;
  }

  const innerWidth = width - margin.left - margin.right;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <clipPath id={`${displayerKey}clip-top`}>
          <rect width={innerWidth} height={height} x={margin.left} y="0" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-top)`}>
        <path
          className="line"
          stroke={spectrum.display.color}
          fill="none"
          strokeWidth="1px"
          d={path}
        />
      </g>
    </svg>
  );
}

export default memo(Top1DChart);
