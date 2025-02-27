import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';

import { useScale2DY } from './utilities/scale.js';

const defaultMargin = { right: 50, top: 0, bottom: 0, left: 0 };

interface YAxisProps {
  label?: string;
  margin?: {
    right: number;
    top: number;
    bottom: number;
    left: number;
  };
}

function YAxis(props: YAxisProps) {
  const { label = '', margin: marginProps = defaultMargin } = props;

  const { width, height } = useChartData();
  const scaleY = useScale2DY();

  const refAxis = useRef<SVGGElement>(null);

  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scaleY,
    'vertical',
    refAxis,
  );

  if (!width || !height) {
    return null;
  }

  return (
    <D3Axis
      ref={refAxis}
      transform={`translate(${width - marginProps.right})`}
      scale={ticksScale}
      axisPosition="right"
      ticks={ticks}
    >
      <text
        fill="#000"
        x={-marginProps.top}
        y={-(marginProps.right - 5)}
        dy="0.71em"
        transform="rotate(-90)"
        textAnchor="end"
      >
        {label}
      </text>
    </D3Axis>
  );
}

export default memo(YAxis);
