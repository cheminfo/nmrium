import { useEffect, useMemo, useRef } from 'react';

import useDraggable, { Draggable } from '../draggble/useDraggable';

import { ResizerProps, Position } from './Resizer';

interface UseResizer {
  right: Draggable;
  left: Draggable;
  prevPosition: Position;
  currentPosition: Position;
  isActive: boolean;
}

export default function useResizer(props: ResizerProps): UseResizer {
  const {
    initialPosition = { x1: 10, x2: 40 },
    onStart,
    onMove,
    onEnd,
    parentElement,
  } = props;

  const currentPosition = useRef<{ x1: number; x2: number }>(initialPosition);
  const prevPosition = useRef<{ x1: number; x2: number }>(initialPosition);
  const activeRef = useRef<boolean>(false);

  const triggerEvent = useRef((position: Position, status: string | null) => {
    switch (status) {
      case 'start':
        onStart?.(position);
        activeRef.current = true;
        break;
      case 'move':
        onMove?.(position);
        break;
      case 'end':
        prevPosition.current = position;
        activeRef.current = false;

        onEnd?.(position);
        break;
      default:
        break;
    }
  });

  const right = useDraggable({
    position: { x: initialPosition.x2, y: 0 },
    parentElement,
    fromEdge: true,
  });
  const left = useDraggable({
    position: { x: initialPosition.x1, y: 0 },
    parentElement,
    fromEdge: true,
  });

  useEffect(() => {
    currentPosition.current = {
      x1: left.position.value.x,
      x2: right.position.value.x,
    };
  }, [left.position.value.x, right.position.value.x]);

  useEffect(() => {
    const {
      value: { x },
      action,
    } = left.position;
    const position: Position = {
      x1: x,
      x2: currentPosition.current.x2,
    };
    triggerEvent.current(position, action);
  }, [left.position]);

  useEffect(() => {
    const {
      value: { x },
      action,
    } = right.position;
    const position: Position = {
      x1: currentPosition.current.x1,
      x2: x,
    };
    triggerEvent.current(position, action);
  }, [right.position]);

  return useMemo(
    () => ({
      left,
      right,
      prevPosition: prevPosition.current,
      currentPosition: currentPosition.current,
      isActive: activeRef.current,
    }),
    [left, right],
  );
}
