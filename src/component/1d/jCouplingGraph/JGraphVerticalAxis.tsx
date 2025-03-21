import type { ScaleLinear } from 'd3';
import { useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useChartData } from '../../context/ChartContext.js';
import { D3Axis } from '../../elements/D3Axis.js';

import { useJGraph } from './JGraphContext.js';

export function JGraphVerticalAxis() {
  const { width, margin } = useChartData();
  const { scaleY } = useJGraph();

  if (!scaleY) return null;

  return (
    <LinearVerticalAxis
      x={margin.left + 12}
      y={0}
      scale={scaleY}
      width={width - margin.right}
    />
  );
}

interface VerticalAxisProps {
  width: number;
  scale: ScaleLinear<number, number>;
  x: number;
  y: number;
}

function LinearVerticalAxis(props: VerticalAxisProps) {
  const { scale, x, y, width } = props;
  const ref = useRef<SVGGElement>(null);
  const { scale: ticksScale, ticks } = useLinearPrimaryTicks(
    scale,
    'vertical',
    ref,
  );
  return (
    <D3Axis
      ref={ref}
      transform={`translate(${x}, ${y})`}
      scale={ticksScale}
      axisPosition="left"
      gridSize={width - x}
      ticks={ticks}
      showGrid
      primaryGridProps={{ strokeDasharray: '0' }}
    />
  );
}
