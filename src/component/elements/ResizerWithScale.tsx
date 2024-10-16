import { useEffect, useRef, useState } from 'react';

import { useScaleX } from '../1d/utilities/scale.js';
import { useGlobal } from '../context/GlobalContext.js';

import SVGResizer, { Position, ResizerProps } from './resizer/SVGResizer.js';

interface ResizerWithScaleProps {
  disabled: boolean;
  from: number;
  to: number;
  onEnd: ResizerProps['onEnd'];
  children: ResizerProps['children'];
}

export function ResizerWithScale(props: ResizerWithScaleProps) {
  const { from, to, onEnd, disabled, children } = props;
  const { viewerRef } = useGlobal();
  const scaleX = useScaleX();
  const x2 = scaleX()(from);
  const x1 = scaleX()(to);
  const [position, setPosition] = useState({ x1, x2 });
  const startPositionRef = useRef<Position>();

  useEffect(() => {
    const x2 = scaleX()(from);
    const x1 = scaleX()(to);
    setPosition({ x1, x2 });
  }, [from, scaleX, to]);

  function handleMove(p: Position) {
    if (p.x2 >= p.x1) {
      setPosition(p);
    }
  }

  function handleEndMove(p: Position) {
    if (p.x2 >= p.x1) {
      onEnd?.(p);
    } else if (startPositionRef.current) {
      setPosition({ ...startPositionRef.current });
    }
  }

  function handleStartResize(p: Position) {
    startPositionRef.current = p;
  }

  return (
    <SVGResizer
      position={position}
      onStart={handleStartResize}
      onEnd={handleEndMove}
      parentElement={viewerRef}
      disabled={disabled}
      onMove={handleMove}
    >
      {children}
    </SVGResizer>
  );
}
