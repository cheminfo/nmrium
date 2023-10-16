import { ReactNode } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { TraceDirection } from '../../../reducer/Reducer';
import { PathBuilder } from '../../../utility/PathBuilder';
import {
  get2DXScale,
  get2DYScale,
  getSliceYScale,
} from '../../utilities/scale';

import { useActivePhaseTraces } from './useActivePhaseTraces';

interface SpectrumPhaseTraceProps extends React.SVGAttributes<SVGGElement> {
  data: { x: Float64Array; re: Float64Array };
  position: { x: number; y: number };
  color: string;
  direction: TraceDirection;
  children?: ReactNode;
}

function usePath(x: Float64Array, y: Float64Array, direction: TraceDirection) {
  const { width, margin, height, xDomain, yDomain, mode } = useChartData();
  const { scaleRatio } = useActivePhaseTraces();

  if (direction === 'horizontal') {
    const scaleX = get2DXScale({ margin, width, xDomain, mode });
    const scaleY = getSliceYScale(y, height, 'RTL', {
      margin: margin.top + margin.bottom,
      scaleRatio,
    });

    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(scaleX(x[0]), scaleY(y[0]));
    for (let i = 1; i < x.length; i++) {
      pathBuilder.lineTo(scaleX(x[i]), scaleY(y[i]));
    }

    return pathBuilder.toString();
  }

  const scaleX = get2DYScale({ margin, height, yDomain });
  const scaleY = getSliceYScale(y, width, 'RTL', {
    margin: margin.left + margin.right,
    scaleRatio,
  });

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(scaleY(y.at(-1) as number), scaleX(x.at(-1) as number));

  for (let i = x.length - 2; i >= 0; i--) {
    pathBuilder.lineTo(scaleY(y[i]), scaleX(x[i]));
  }

  return pathBuilder.toString();
}

export function SpectrumPhaseTrace(props: SpectrumPhaseTraceProps) {
  const { data, position, color, direction, children, ...othersProps } = props;
  const { width, margin, height } = useChartData();

  const { x, re } = data;
  const path = usePath(x, re, direction);
  const innerheight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const translateY = direction === 'horizontal' ? position.y - innerheight : 0;
  const translateX = direction === 'vertical' ? position.x - innerWidth : 0;

  return (
    <g
      style={{
        transform: `translate(${translateX}px,${translateY}px) `,
      }}
      {...othersProps}
    >
      <path
        className="line"
        stroke={color}
        strokeWidth="1"
        fill="transparent"
        d={path}
        pointerEvents="none"
      />
      {children}
    </g>
  );
}
