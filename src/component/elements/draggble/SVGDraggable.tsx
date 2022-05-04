import { useEffect, ReactFragment } from 'react';

import useDraggable, { Position } from './useDraggable';

type ChildType =
  | Array<React.ReactElement>
  | React.ReactElement
  | ReactFragment
  | boolean
  | null;

type PositionChangeHandler = (data: Position) => void;

export interface DraggableProps {
  children?: ChildType | ((x1: number, x2: number) => ChildType);
  initialPosition?: Position;
  width: number;
  height: number;
  onStart?: PositionChangeHandler;
  onMove?: PositionChangeHandler;
  onEnd?: PositionChangeHandler;
  parentElement?: HTMLElement | null;
  dragHandleClassName?: string;
}

export default function SVGDraggable(props: DraggableProps) {
  const {
    children,
    initialPosition = { x: 0, y: 0 },
    width,
    height,
    onStart,
    onMove,
    onEnd,
    parentElement,
    dragHandleClassName,
  } = props;

  const {
    position: {
      value: { x, y },
      action,
    },
    onMouseDown,
  } = useDraggable({
    position: initialPosition,
    parentElement,
    dragHandleClassName,
  });

  useEffect(() => {
    const position: Position = {
      x,
      y,
    };

    switch (action) {
      case 'start':
        onStart?.(position);
        break;
      case 'move':
        onMove?.(position);
        break;
      case 'end':
        onEnd?.(position);
        break;
      default:
        break;
    }
  }, [action, onEnd, onMove, onStart, x, y]);

  return (
    <g
      style={{
        transform: `translate(${x}px,${y}px)`,
      }}
      onMouseDown={onMouseDown}
    >
      {typeof children === 'function' ? children(width, height) : children}
    </g>
  );
}
