import { useRef } from 'react';

export interface Position {
  x: number;
  y: number;
}

interface DragChangeCb {
  position: Position;
  action: Action;
  isActive: boolean;
}

interface UseDraggable {
  position: Position;
  parentElement?: HTMLElement | null;
  fromEdge?: boolean;
  dragHandleClassName?: string;
  onChange: (dragEvent: DragChangeCb) => void;
}

export interface Draggable {
  onPointerDown: (
    event: React.PointerEvent<HTMLDivElement | SVGElement>,
  ) => void;
}
type Action = 'start' | 'move' | 'end' | null;

export default function useDraggable(props: UseDraggable): Draggable {
  const {
    position: { x, y },
    parentElement,
    fromEdge = false,
    dragHandleClassName,
    onChange,
  } = props;

  const isActive = useRef<boolean>(false);
  const positionRef = useRef<Position>({ x, y });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement | SVGElement>) {
    e.stopPropagation();
    isActive.current = true;
    const eventTarget = e.currentTarget as HTMLElement;
    positionRef.current = { x, y };

    const classes =
      (e.target as HTMLElement).getAttribute('class')?.split(' ') || [];
    if (
      (dragHandleClassName && classes.includes(dragHandleClassName)) ||
      !dragHandleClassName
    ) {
      const _parentElement = parentElement || eventTarget?.parentElement;
      if (_parentElement) {
        const parentBounding = _parentElement.getBoundingClientRect();
        const currentBounding = eventTarget?.getBoundingClientRect();
        const startPosition: Position = {
          x: parentBounding.x + (!fromEdge ? e.clientX - currentBounding.x : 0),
          y: parentBounding.y + (!fromEdge ? e.clientY - currentBounding.y : 0),
        };

        if (parentBounding) {
          positionRef.current = startPosition;
        }
        onChange({ position: { x, y }, action: 'start', isActive: true });
      }

      window.addEventListener('pointermove', moveCallback);
      window.addEventListener('pointerup', upCallback);
    }

    function upCallback(e: PointerEvent) {
      e.stopPropagation();
      if (isActive.current) {
        onChange({
          position: {
            x: e.clientX - positionRef.current.x,
            y: e.clientY - positionRef.current.y,
          },
          action: 'end',
          isActive: false,
        });
        isActive.current = false;
      }

      window.removeEventListener('pointermove', moveCallback);
      window.removeEventListener('pointerup', upCallback);
    }
    function moveCallback(e: PointerEvent) {
      e.stopPropagation();

      if (isActive.current) {
        onChange({
          position: {
            x: e.clientX - positionRef.current.x,
            y: e.clientY - positionRef.current.y,
          },
          action: 'move',
          isActive: true,
        });
      }
    }
  }

  return { onPointerDown };
}
