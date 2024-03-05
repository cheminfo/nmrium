import { ReactFragment } from 'react';

import useDraggable, { Position } from './useDraggable';

type ChildType =
  | React.ReactElement[]
  | React.ReactElement
  | ReactFragment
  | boolean
  | null;

type PositionChangeHandler = (data: Position) => void;

export interface DraggableProps {
  children?: ChildType | ((x1: number, x2: number) => ChildType);
  position?: Position;
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
    position: cPosition = { x: 0, y: 0 },
    width,
    height,
    onStart,
    onMove,
    onEnd,
    parentElement,
    dragHandleClassName,
  } = props;

  const { onPointerDown } = useDraggable({
    position: cPosition,
    onChange: (dragEvent) => {
      const { action, position } = dragEvent;
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
    },
    parentElement,
    dragHandleClassName,
  });

  return (
    <g
      style={{
        transform: `translate(${cPosition.x}px,${cPosition.y}px)`,
      }}
      onPointerDown={onPointerDown}
    >
      {typeof children === 'function' ? children(width, height) : children}
    </g>
  );
}
