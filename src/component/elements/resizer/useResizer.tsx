import { useRef } from 'react';

import useDraggable, { Draggable } from '../draggable/useDraggable';

import { ResizerProps, Position } from './SVGResizer';

interface UseResizer {
  right: Draggable;
  left: Draggable;
  isActive: boolean;
}

export default function useResizer(props: ResizerProps): UseResizer {
  const {
    position = { x1: 0, x2: 0 },
    onStart,
    onMove,
    onEnd,
    parentElement,
  } = props;

  const activeRef = useRef<boolean>(false);

  function triggerEvent(position: Position, status: string | null) {
    switch (status) {
      case 'start':
        onStart?.(position);
        activeRef.current = true;
        break;
      case 'move':
        onMove?.(position);
        break;
      case 'end':
        activeRef.current = false;

        onEnd?.(position);
        break;
      default:
        break;
    }
  }

  const right = useDraggable({
    position: { x: position.x2, y: 0 },
    parentElement,
    fromEdge: true,
    onChange: (dragEvent) => {
      const {
        action,
        position: { x },
      } = dragEvent;
      const resizerBoundaries: Position = {
        x1: position.x1,
        x2: x,
      };
      triggerEvent(resizerBoundaries, action);
    },
  });
  const left = useDraggable({
    position: { x: position.x1, y: 0 },
    parentElement,
    fromEdge: true,
    onChange(dragEvent) {
      const {
        action,
        position: { x },
      } = dragEvent;
      const resizerBoundaries: Position = {
        x1: x,
        x2: position.x2,
      };
      triggerEvent(resizerBoundaries, action);
    },
  });

  return {
    left,
    right,
    isActive: activeRef.current,
  };
}
