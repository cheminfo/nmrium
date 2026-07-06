import type { Spectrum1D } from '@zakodium/nmrium-core';
import { memo, useRef } from 'react';

import { Signals1D } from '../../1d-2d/components/Signals1D.tsx';
import { useChartData } from '../../context/ChartContext.js';
import useXYReduce from '../../hooks/useXYReduce.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { use1DTraceYScale, useScale2DY } from '../utilities/scale.js';

import { Ranges1D } from './Ranges1D.tsx';

interface Left1DChartProps {
  horizontalMargin?: number;
  data: Spectrum1D;
}

interface UsePathOptions {
  horizontalMargin?: number;
  width: number;
}

function usePath(spectrum: Spectrum1D, options: UsePathOptions) {
  const { width, horizontalMargin = 10 } = options;
  const scaleX = useScale2DY();
  const scaleY = use1DTraceYScale(spectrum.id, width, horizontalMargin);
  const xyReduce = useXYReduce('YAxis');

  const { x, re: y } = spectrum.data;
  const pathPoints = xyReduce({ x, y });

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(
    scaleY(pathPoints.y.at(-1) as number),
    scaleX(pathPoints.x.at(-1) as number),
  );

  for (let i = pathPoints.x.length - 2; i >= 0; i--) {
    pathBuilder.lineTo(scaleY(pathPoints.y[i]), scaleX(pathPoints.x[i]));
  }

  return pathBuilder.toString();
}

function Left1DChart({
  horizontalMargin = 10,
  data: spectrum,
}: Left1DChartProps) {
  const { height, margin, displayerKey } = useChartData();
  const svgRef = useRef<SVGSVGElement>(null);
  const scale = useScale2DY();

  const width = margin.left;

  const path = usePath(spectrum, { horizontalMargin, width });
  const ranges = spectrum.ranges.values;

  const innerHeight = height - margin.bottom - margin.top;

  if (!innerHeight || !width) return null;

  return (
    <svg
      ref={svgRef}
      style={{ overflow: 'visible' }}
      viewBox={`0 0 ${width} ${innerHeight + margin.top}`}
      width={width}
      height={innerHeight + margin.top}
    >
      <defs>
        <clipPath id={`${displayerKey}clip-left`}>
          <rect width={width} height={innerHeight} x="0" y={margin.top} />
        </clipPath>
        <clipPath id={`${displayerKey}clip-left-ranges`}>
          <rect width={width + 20} height={innerHeight} x="0" y={margin.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-left)`}>
        <path
          className="line"
          stroke={spectrum.display.color}
          fill="none"
          d={path}
        />
      </g>
      <g clipPath={`url(#${displayerKey}clip-left-ranges)`}>
        <Ranges1D
          ranges={ranges}
          orientation="vertical"
          spectrumId={spectrum.id}
        />
        <Signals1D
          ranges={ranges}
          orientation="vertical"
          spectrumId={spectrum.id}
          scale={scale}
          position={margin.left}
        />
      </g>
    </svg>
  );
}

export default memo(Left1DChart);
