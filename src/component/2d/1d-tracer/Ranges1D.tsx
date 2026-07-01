import styled from '@emotion/styled';
import type { Jcoupling, Range, Signal1D } from '@zakodium/nmr-types';

import { useChartData } from '../../context/ChartContext.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface Range1DTraceProps {
  position: number;
  size: number;
  orientation?: 'horizontal' | 'vertical';
  opacity?: number;
  onClick?: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}

interface ElementLayout {
  groupTransform: string;
  pathD: string;
  textProps: {
    x?: number;
    y?: number;
    textAnchor?: 'start' | 'middle' | 'end';
    dominantBaseline?: 'middle' | 'auto' | 'hanging';
  };
}

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
    size,
    orientation = 'horizontal',
    opacity = 1,
    onClick,
  } = props;
  const { margin } = useChartData();

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
    const { from, to, id } = range;
    const start = scale(to);
    const size = scale(from) - start;

    function handleAddSignal(e: React.MouseEvent<SVGGElement, MouseEvent>) {
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
    }

    return (
      <Range1DTrace
        orientation={orientation}
        key={id}
        position={start}
        size={size}
        onClick={handleAddSignal}
      />
    );
  });
}
