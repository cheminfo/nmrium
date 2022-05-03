import { useCallback, useMemo, useRef, useState } from 'react';

export interface Position {
  x: number;
  y: number;
}

interface UseDraggable {
  position: Position;
  parentElement?: HTMLElement | null;
  fromEdge?: boolean;
  dragHandleClassName?: string;
}
export interface Draggable {
  onMouseDown: (
    event: React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>,
  ) => void;
  position: { value: Position; action: Action };
  isActive: boolean;
}
type Action = 'start' | 'move' | 'end' | null;

export default function useDraggable(props: UseDraggable): Draggable {
  const {
    position: { x, y },
    parentElement,
    fromEdge = false,
    dragHandleClassName,
  } = props;

  const isActive = useRef<boolean>(false);
  const positionRef = useRef<Position>({ x, y });
  const [position, setPosition] = useState<{ value: Position; action: Action }>(
    {
      value: { x, y },
      action: null,
    },
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>) => {
      e.stopPropagation();
      isActive.current = true;
      const eventTarget = e.currentTarget as HTMLElement;

      const classes =
        (e.target as HTMLElement).getAttribute('class')?.split(' ') || [];
      if (
        (dragHandleClassName && classes.includes(dragHandleClassName)) ||
        !dragHandleClassName
      ) {
        const _parentElement = parentElement
          ? parentElement
          : eventTarget?.parentElement;
        if (_parentElement) {
          const parentBounding = _parentElement.getBoundingClientRect();
          const currentBounding = eventTarget?.getBoundingClientRect();
          const startPosition: Position = {
            x:
              parentBounding.x +
              (!fromEdge ? e.clientX - currentBounding.x : 0),
            y:
              parentBounding.y +
              (!fromEdge ? e.clientY - currentBounding.y : 0),
          };

          if (parentBounding) {
            positionRef.current = startPosition;
          }
          setPosition((prevPortion) => ({ ...prevPortion, action: 'start' }));
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }

      function onMouseUp(e: MouseEvent) {
        e.stopPropagation();
        if (isActive.current) {
          setPosition({
            value: {
              x: e.clientX - positionRef.current.x,
              y: e.clientY - positionRef.current.y,
            },
            action: 'end',
          });
          isActive.current = false;
        }

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      function onMouseMove(e: MouseEvent) {
        e.stopPropagation();

        if (isActive.current) {
          setPosition({
            value: {
              x: e.clientX - positionRef.current.x,
              y: e.clientY - positionRef.current.y,
            },
            action: 'move',
          });
        }
      }
    },
    [dragHandleClassName, fromEdge, parentElement, x, y],
  );

  return useMemo(
    () => ({
      onMouseDown,
      position,
      isActive: isActive.current,
    }),
    [onMouseDown, position],
  );
}
