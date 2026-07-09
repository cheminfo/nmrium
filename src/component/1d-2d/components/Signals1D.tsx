import styled from '@emotion/styled';
import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { ScaleLinear } from 'd3-scale';
import type { ComponentProps } from 'react';
import { useMemo, useRef, useState } from 'react';

import { Anchor } from '../../AnchorSVG.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';
import { useAddMultipletSignal } from '../../hooks/useAddMultipletSignal.tsx';

import type { IndicatorOrientation } from './RangeIndicator.tsx';
import { useMarginBottom } from './RangeIndicator.tsx';

const POINTER_SIZE = 4;
interface SignalCursorProps {
  range: Range;
  scale: ScaleLinear<number, number, number>;
  orientation: IndicatorOrientation;
  spectrumId: string;
}
interface InnerSignals1D extends SignalCursorProps {
  position: number;
}
interface Signals1DProps extends Omit<InnerSignals1D, 'range'> {
  ranges: Range[];
}
const Container = styled.g`
  .signals-block {
    display: none;
  }

  &:hover .signals-block,
  .signals-block.dragging {
    display: block !important;
  }
`;

export function Signals1D(props: Signals1DProps) {
  const { ranges, orientation, spectrumId, scale, position } = props;

  return ranges.map((range) => {
    const { id } = range;

    return (
      <Container key={id} data-no-export="true">
        <SignalCursor
          spectrumId={spectrumId}
          range={range}
          orientation={orientation}
          scale={scale}
        />
        <InnerSignals1D
          {...{ orientation, spectrumId, scale, position, range }}
        />
      </Container>
    );
  });
}

function SignalCursor(props: SignalCursorProps) {
  const { orientation, range, scale, spectrumId } = props;
  const { from, to } = range;
  const fromInPixel = scale(from);
  const toInPixel = scale(to);
  const start = Math.min(fromInPixel, toInPixel);
  const size = Math.abs(fromInPixel - toInPixel);

  const top = useMarginBottom(orientation);
  const [pointerPosition, setPosition] = useState<number | null>(null);
  const addMultipletSignal = useAddMultipletSignal();

  function handleMove(event: React.MouseEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const local =
      orientation === 'horizontal'
        ? event.clientX - rect.left
        : event.clientY - rect.top;
    setPosition(local);
  }

  function handleAddSignal(e: React.MouseEvent<SVGGElement, MouseEvent>) {
    const boundingRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - boundingRect.left + start;
    const y = e.clientY - boundingRect.top + start;

    const valueInPixel = orientation === 'horizontal' ? x : y;
    const delta = scale.invert(valueInPixel);
    addMultipletSignal({ range, delta, spectrumId });
  }

  return (
    <g
      transform={
        orientation === 'horizontal'
          ? `translate(${start} ${top})`
          : `translate(${top} ${start})`
      }
      onMouseMove={handleMove}
      onMouseLeave={() => setPosition(null)}
      onClick={handleAddSignal}
    >
      {pointerPosition !== null && (
        <circle
          cx={orientation === 'horizontal' ? pointerPosition : POINTER_SIZE + 1}
          cy={orientation === 'horizontal' ? POINTER_SIZE + 1 : pointerPosition}
          r={POINTER_SIZE}
          fill="red"
        />
      )}
      <BackArea orientation={orientation} size={size} />
    </g>
  );
}

function InnerSignals1D(props: InnerSignals1D) {
  const { range, orientation, spectrumId, scale, position } = props;
  const draggingAnchorRef = useRef<{ index: number; delta: number } | null>(
    null,
  );
  // Only used during active drag for local updates
  const [draggingAnchor, setDraggingAnchor] = useState<{
    index: number;
    delta: number;
  } | null>(null);
  const dispatch = useDispatch();

  function handleDragMove(
    index: number,
    newPosition: { x: number; y: number },
  ) {
    // console.log(newX)

    const delta = orientation === 'horizontal' ? newPosition.x : newPosition.y;
    const from = orientation === 'horizontal' ? range.from : range.to;
    const to = orientation === 'horizontal' ? range.to : range.from;
    const clampedX = Math.max(scale(to), Math.min(scale(from), delta));
    const updated = { index, delta: scale.invert(clampedX) };
    draggingAnchorRef.current = updated;
    setDraggingAnchor(updated);
  }
  function handleDragEnd(signal: Signal1D) {
    const finalDelta = draggingAnchorRef.current?.delta;

    if (!finalDelta) return;

    draggingAnchorRef.current = null;
    setDraggingAnchor(null);
    dispatch({
      type: 'CHANGE_SIGNAL_DELTA',
      payload: {
        value: finalDelta,
        rangeId: range.id,
        signalId: signal.id,
        spectrumId,
      },
    });
  }

  function handleDelete(signal: Signal1D) {
    dispatch({
      type: 'DELETE_1D_SIGNAL',
      payload: {
        rangeId: range.id,
        signalId: signal.id,
        spectrumId,
      },
    });
  }

  const signals = useMemo(() => {
    const result: Signal1D[] = [];
    let flatIndex = 0;

    for (const signal of range.signals ?? []) {
      const isDragging = draggingAnchor?.index === flatIndex;

      result.push({
        ...signal,
        delta: isDragging ? draggingAnchor.delta : signal.delta,
      });

      flatIndex++;
    }

    return result;
  }, [range, draggingAnchor?.index, draggingAnchor?.delta]);

  if (!scale) return null;
  return (
    <g className={`signals-block ${draggingAnchor !== null ? 'dragging' : ''}`}>
      {signals.map((signal, index) => {
        const { id, delta } = signal;
        const x = orientation === 'horizontal' ? scale(delta) : position - 5;
        const y = orientation === 'horizontal' ? position - 5 : scale(delta);

        return (
          <Anchor
            key={id}
            position={{ x, y }}
            shape="circle"
            onDragMove={(newPosition) => handleDragMove(index, newPosition)}
            onDragEnd={() => handleDragEnd(signal)}
            onDelete={() => handleDelete(signal)}
            cursorOrientation={orientation}
            anchorStyle={{
              guideStyle: 'dashed',
              size: 8,
              hoverSize: 15,
              dragSize: 15,
              hoverStroke: 'red',
              dragStroke: 'darkgreen',
              guideColor: 'red',
              guideDragColor: 'darkgreen',
              fill: 'red',
              stroke: 'transparent',
            }}
            svgHeight={position}
          />
        );
      })}
    </g>
  );
}

interface BackAreaProps extends ComponentProps<'rect'> {
  orientation: IndicatorOrientation;
  size: number;
  length?: number;
}

function BackArea(props: BackAreaProps) {
  const { orientation, size, length = 5, ...other } = props;
  return (
    <rect
      width={orientation === 'horizontal' ? size : length * 2}
      height={orientation === 'horizontal' ? length * 2 : size}
      fill="transparent"
      data-no-export="true"
      {...other}
    />
  );
}
