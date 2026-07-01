import styled from '@emotion/styled';
import type { Jcoupling, Range, Signal1D } from '@zakodium/nmr-types';

import { useChartData } from '../../context/ChartContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { formatNumber } from '../../utility/formatNumber.ts';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface Range1DTraceProps {
  position: number;
  value: number | undefined;
  format: string;
  size: number;
  orientation?: 'horizontal' | 'vertical';
  opacity?: number;
  onClick?: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}

interface ElementLayout {
  groupTransform: string;
  pathD: string;
  textTransform?: string;
  textProps: {
    x?: number;
    y?: number;
    textAnchor?: 'start' | 'middle' | 'end';
    dominantBaseline?: 'middle' | 'auto' | 'hanging';
  };
}

const Text = styled.text`
  font-size: 11px;
  fill: black;
`;
const Path = styled.path`
  fill: none;
  stroke-width: 1px;
  shape-rendering: crispedges;
  stroke: black;

  &:hover {
    stroke: red;
  }
`;
const length = 5;
const innerMargin = 10;

function Range1DTrace(props: Range1DTraceProps) {
  const {
    position,
    value,
    size,
    format,
    orientation = 'horizontal',
    opacity = 1,
    onClick,
  } = props;
  const { margin } = useChartData();

  const label = value ? formatNumber(value, format) : '';
  const half = Math.round(size / 2);

  const layout: ElementLayout =
    orientation === 'vertical'
      ? {
          groupTransform: `translate(${margin.left - innerMargin} ${position})`,
          pathD: `M0 0 L${length} 0 L${length} ${size} L0 ${size}`,
          textProps: {
            x: -9,
            y: half,
            textAnchor: 'end',
            dominantBaseline: 'middle',
          },
        }
      : {
          groupTransform: `translate(${position} ${margin.top - innerMargin})`,
          pathD: `M0 0 L0 ${length} L${size} ${length} L${size} 0`,
          textProps: {},
          textTransform: `rotate(-90) translate(5 ${half + 4})`,
        };

  return (
    <g transform={layout.groupTransform} style={{ opacity }} onClick={onClick}>
      <rect
        x={orientation === 'vertical' ? -(margin.left - innerMargin) : 0}
        y={orientation === 'vertical' ? 0 : -(margin.top - innerMargin)}
        width={orientation === 'vertical' ? margin.left : size}
        height={orientation === 'vertical' ? size : margin.top}
        fill="transparent"
      />
      <Text transform={layout.textTransform} {...layout.textProps}>
        {label}
      </Text>
      <Path d={layout.pathD} />
    </g>
  );
}

interface Ranges1DProps {
  ranges: Range[];
  orientation: 'horizontal' | 'vertical';
  spectrumId: string;
}

export function Ranges1D(props: Ranges1DProps) {
  const { ranges, orientation, spectrumId } = props;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const dispatch = useDispatch();
  const scale = orientation === 'horizontal' ? scaleX : scaleY;

  return ranges.map((range) => {
    const { from, to, integration, id } = range;
    const start = scale(to);
    const size = scale(from) - start;

    return (
      <Range1DTrace
        orientation={orientation}
        key={id}
        position={start}
        size={size}
        value={integration}
        format="0.00"
        onClick={(e) => {
          const boundingRect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - boundingRect.left + start;
          const y = e.clientY - boundingRect.top + start;

          const valueInPixel = orientation === 'horizontal' ? x : y;
          const delta = scale.invert(valueInPixel);

          const updatedRange = structuredClone(range);
          const signal: Signal1D = {
            id: crypto.randomUUID(),
            delta,
            js: [
              {
                multiplicity: 'm',
              } as Jcoupling,
            ],
            kind: 'signal',
            multiplicity: 'm',
          };
          updatedRange.signals.push(signal);

          dispatch({
            type: 'UPDATE_RANGE',
            payload: {
              range: updatedRange,
              spectrumId,
            },
          });
        }}
      />
    );
  });
}
