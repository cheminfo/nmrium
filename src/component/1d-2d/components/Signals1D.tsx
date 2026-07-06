import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { ScaleLinear } from 'd3-scale';
import { useMemo, useRef, useState } from 'react';

import { Anchor } from '../../AnchorSVG.tsx';
import { useDispatch } from '../../context/DispatchContext.tsx';

interface Signals1DProps {
  spectrumId: string;
  ranges: Range[];
  orientation: 'horizontal' | 'vertical';
  scale: ScaleLinear<number, number, number>;
  position: number;
}

interface SignalWithRange extends Signal1D {
  from: number;
  to: number;
  rangeID: string;
}

export function Signals1D(props: Signals1DProps) {
  const { ranges, orientation, spectrumId, scale, position } = props;
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
    range: { from: number; to: number },
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
  function handleDragEnd(signal: SignalWithRange) {
    const finalDelta = draggingAnchorRef.current?.delta;

    if (!finalDelta) return;

    draggingAnchorRef.current = null;
    setDraggingAnchor(null);
    dispatch({
      type: 'CHANGE_SIGNAL_DELTA',
      payload: {
        value: finalDelta,
        rangeId: signal.rangeID,
        signalId: signal.id,
        spectrumId,
      },
    });
  }

  function handleDelete(signal: SignalWithRange) {
    dispatch({
      type: 'DELETE_1D_SIGNAL',
      payload: {
        rangeId: signal.rangeID,
        signalId: signal.id,
        spectrumId,
      },
    });
  }

  const signals = useMemo(() => {
    const result: SignalWithRange[] = [];
    let flatIndex = 0;

    for (const range of ranges ?? []) {
      for (const signal of range.signals ?? []) {
        const isDragging = draggingAnchor?.index === flatIndex;

        result.push({
          ...signal,
          delta: isDragging ? draggingAnchor.delta : signal.delta,
          from: range.from,
          to: range.to,
          rangeID: range.id,
        });

        flatIndex++;
      }
    }

    return result;
  }, [ranges, draggingAnchor?.index, draggingAnchor?.delta]);

  if (!scale) return null;
  return (
    <g>
      {signals.map((signal, index) => {
        const { rangeID, id, delta, from, to } = signal;
        const x = orientation === 'horizontal' ? scale(delta) : position - 5;
        const y = orientation === 'horizontal' ? position - 5 : scale(delta);

        return (
          <Anchor
            key={`${id}-${rangeID}`}
            position={{ x, y }}
            shape="circle"
            onDragMove={(newPosition) =>
              handleDragMove(index, newPosition, { from, to })
            }
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
