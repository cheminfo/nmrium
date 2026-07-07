import styled from '@emotion/styled';
import { useState } from 'react';

import { useChartData } from '../../context/ChartContext.tsx';
import { formatNumber } from '../../utility/formatNumber.ts';

const Path = styled.path`
  fill: none;
  stroke-width: 1px;
  shape-rendering: crispedges;
  stroke: black;

  &:hover {
    stroke: red;
  }
`;
const Text = styled.text`
  font-size: 11px;
  fill: black;
`;

type Orientation = 'horizontal' | 'vertical';

interface RangeIndicatorProps extends Pick<
  React.HTMLAttributes<SVGGElement>,
  'onClick'
> {
  position: number;
  size: number;
  orientation?: Orientation;
  top?: number;
  value?: number;
  format?: string;
  opacity?: number;
}

const BRACKET_LENGTH = 5;
const INNER_MARGIN = 10;
const POINTER_SIZE = 4;

interface Layout {
  groupTransform: string;
  pathD: string;
  textTransform: string;
  textAnchor: 'start' | 'end' | undefined;
  backArea: { width: number; height: number };
}

function getLayout(
  orientation: Orientation,
  position: number,
  size: number,
  top: number,
): Layout {
  if (orientation === 'vertical') {
    return {
      groupTransform: `translate(${top} ${position})`,
      pathD: `M0 0 L${BRACKET_LENGTH} 0 L${BRACKET_LENGTH} ${size} L0 ${size}`,
      textTransform: `translate(${-BRACKET_LENGTH - 4} ${Math.round(size / 2) + 4})`,
      textAnchor: 'end',
      backArea: { width: BRACKET_LENGTH * 2, height: size },
    };
  }

  return {
    groupTransform: `translate(${position} ${top})`,
    pathD: `M0 0 L0 ${BRACKET_LENGTH} L${size} ${BRACKET_LENGTH} L${size} 0`,
    textTransform: `rotate(-90) translate(5 ${Math.round(size / 2) + 4})`,
    textAnchor: undefined,
    backArea: { width: size, height: BRACKET_LENGTH * 2 },
  };
}

export function RangeIndicator(props: RangeIndicatorProps) {
  const {
    position,
    size,
    orientation = 'horizontal',
    top,
    value,
    format,
    opacity = 1,
    onClick,
  } = props;
  const { margin, height, displayerMode } = useChartData();

  const resolvedTop =
    (displayerMode === '1D'
      ? height - margin.bottom
      : (top ?? (orientation === 'vertical' ? margin.left : margin.top))) -
    INNER_MARGIN;

  const layout = getLayout(orientation, position, size, resolvedTop);

  const [pointerPosition, setPosition] = useState<number | null>(null);

  function handleMove(event: React.MouseEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const local =
      orientation === 'horizontal'
        ? event.clientX - rect.left
        : event.clientY - rect.top;
    setPosition(local);
  }

  return (
    <g
      transform={layout.groupTransform}
      style={{ opacity }}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setPosition(null)}
    >
      <Path d={layout.pathD} />
      {value !== undefined && (
        <Text transform={layout.textTransform} textAnchor={layout.textAnchor}>
          {formatNumber(value, format ?? '')}
        </Text>
      )}
      {pointerPosition !== null && (
        <circle
          cx={orientation === 'horizontal' ? pointerPosition : POINTER_SIZE}
          cy={orientation === 'horizontal' ? POINTER_SIZE : pointerPosition}
          r={POINTER_SIZE}
          fill="red"
        />
      )}
      <rect {...layout.backArea} fill="transparent" />
    </g>
  );
}
