import { ScaleLinear } from 'd3';
import { forwardRef, useRef, MutableRefObject } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

interface BaseAxis {
  x: number;
  y: number;
}
interface ScaleAxis {
  scale: ScaleLinear<number, number>;
}

interface Vertical {
  height: number;
  showGrid?: false;
}

interface VerticalGrid {
  height: number;
  showGrid: true;
  width: number;
}

interface Ticks {
  label: string;
  position: number;
}

interface TickAxis {
  ticks: Ticks[];
  // eslint-disable-next-line react/no-unused-prop-types
  ref: MutableRefObject<SVGGElement | null>;
}

type VerticalAxisProps = BaseAxis & (Vertical | VerticalGrid) & ScaleAxis;
type VerticalRenderProps = BaseAxis &
  (Vertical | VerticalGrid) &
  TickAxis & { width?: number };

const VerticalAxis = forwardRef<SVGGElement | null, VerticalRenderProps>(
  (props, ref) => {
    const { x, y, height, width, showGrid, ticks } = props;
    return (
      <g ref={ref} transform={`translate(${x}, ${y})`}>
        <line y2={height} x1={15} x2={15} stroke="black" />
        {ticks.map(({ label, position }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <g key={index + label + position}>
            {showGrid && width && (
              <line
                y1={position}
                y2={position}
                x1={15}
                x2={width - x}
                stroke="lightgray"
              />
            )}
            <line y1={position} y2={position} x1={15} x2={10} stroke="black" />
            <text y={position} dominantBaseline="middle" textAnchor="end">
              {label}
            </text>
          </g>
        ))}
      </g>
    );
  },
);

export function LinearVerticalAxis(props: VerticalAxisProps) {
  const { scale, ...other } = props;
  const ref = useRef<SVGGElement>(null);
  const ticks = useLinearPrimaryTicks(scale, 'vertical', ref);
  return <VerticalAxis {...other} ticks={ticks} ref={ref} />;
}
