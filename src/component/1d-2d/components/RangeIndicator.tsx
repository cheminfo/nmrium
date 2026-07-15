import styled from '@emotion/styled';

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

export type IndicatorOrientation = 'horizontal' | 'vertical';

interface RangeIndicatorProps extends Pick<
  React.HTMLAttributes<SVGGElement>,
  'onClick'
> {
  position: number;
  size: number;
  orientation?: IndicatorOrientation;
  value?: number;
  format?: string;
  opacity?: number;
}
const BRACKET_LENGTH = 5;

interface Layout {
  groupTransform: string;
  pathD: string;
  textTransform: string;
  textAnchor: 'start' | 'end' | undefined;
}

function getLayout(
  orientation: IndicatorOrientation,
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
    };
  }

  return {
    groupTransform: `translate(${position} ${top})`,
    pathD: `M0 0 L0 ${BRACKET_LENGTH} L${size} ${BRACKET_LENGTH} L${size} 0`,
    textTransform: `rotate(-90) translate(5 ${Math.round(size / 2) + 4})`,
    textAnchor: undefined,
  };
}

export function useMarginBottom(
  orientation: IndicatorOrientation,
  offset = 10,
) {
  const { margin, height, displayerMode } = useChartData();
  if (displayerMode === '1D') {
    return height - margin.bottom - offset;
  }

  if (orientation === 'vertical') {
    return margin.left - offset;
  }

  return margin.top - offset;
}

export function RangeIndicator(props: RangeIndicatorProps) {
  const {
    position,
    size,
    orientation = 'horizontal',
    value,
    format,
    opacity = 1,
    onClick,
  } = props;
  const resolvedTop = useMarginBottom(orientation);

  const layout = getLayout(orientation, position, size, resolvedTop);

  return (
    <g transform={layout.groupTransform} style={{ opacity }} onClick={onClick}>
      <Path d={layout.pathD} />
      {value !== undefined && (
        <Text transform={layout.textTransform} textAnchor={layout.textAnchor}>
          {formatNumber(value, format ?? '')}
        </Text>
      )}
    </g>
  );
}
