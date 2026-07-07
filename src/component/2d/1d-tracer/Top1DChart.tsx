import type { Spectrum1D } from '@zakodium/nmrium-core';
import { memo, useRef } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import useXYReduce from '../../hooks/useXYReduce.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { use1DTraceYScale, useScale2DX } from '../utilities/scale.js';

import { Ranges1D } from './Ranges1D.tsx';
import { Signals1D } from './Signals1D.tsx';

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
  const xyReduce = useXYReduce('XAxis');

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
  const svgRef = useRef<SVGSVGElement>(null);

  const path = usePath(spectrum, { height, verticalMargin });
  const ranges = spectrum.ranges.values;

  if (!width || !height) {
    return null;
  }

  const innerWidth = width - margin.left - margin.right;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`${displayerKey}clip-top`}>
          <rect width={innerWidth} height={height} x={margin.left} y="0" />
        </clipPath>
        <clipPath id={`${displayerKey}clip-top-ranges`}>
          <rect width={innerWidth} height={height + 20} x={margin.left} y="0" />
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
      <g clipPath={`url(#${displayerKey}clip-top-ranges)`}>
        <Ranges1D
          ranges={ranges}
          orientation="horizontal"
          spectrumId={spectrum.id}
        />
        <Signals1D
          ranges={ranges}
          svgRef={svgRef}
          orientation="horizontal"
          spectrumId={spectrum.id}
        />
      </g>
    </svg>
  );
}

export default memo(Top1DChart);
