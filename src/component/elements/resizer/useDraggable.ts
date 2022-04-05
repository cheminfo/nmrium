import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDraggable {
  x: number;
  anchor: Anchor;
}
export interface Draggable {
  onMouseDown: (
    event: React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>,
  ) => void;
  position: { x: number; action: Action };
  previousPosition: number;
  isActive: boolean;
  anchor: Anchor;
}
type Action = 'start' | 'move' | 'end' | null;

export type Anchor = 'RIGHT' | 'LEFT';

export default function useDraggable(props: UseDraggable): Draggable {
  const { x, anchor } = props;
  const isActive = useRef<boolean>(false);
  const positionRef = useRef<{ relativeX: number; x: number }>({
    relativeX: x,
    x,
  });
  const [position, setPosition] = useState<{ x: number; action: Action }>({
    x,
    action: null,
  });

  useEffect(() => {
    positionRef.current = { relativeX: x, x };
    setPosition({ x, action: null });
  }, [x]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>) => {
      setPosition({ x: positionRef.current.x, action: 'start' });

      positionRef.current.relativeX = e.clientX - positionRef.current.relativeX;
      isActive.current = true;
      e.stopPropagation();
      function onMouseUp(e: MouseEvent) {
        e.stopPropagation();

        if (isActive.current) {
          const x = e.clientX - positionRef.current.relativeX;
          positionRef.current = { relativeX: x, x };
          setPosition({ x, action: 'end' });
          isActive.current = false;
        }

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      function onMouseMove(e: MouseEvent) {
        e.stopPropagation();

        if (isActive.current) {
          setPosition({
            x: e.clientX - positionRef.current.relativeX,
            action: 'move',
          });
        }
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [],
  );

  return {
    onMouseDown,
    position,
    previousPosition: positionRef.current.x,
    isActive: isActive.current,
    anchor,
  };
}
