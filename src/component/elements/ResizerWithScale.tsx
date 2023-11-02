import { useEffect, useState } from 'react';

import { useScaleX } from '../1d/utilities/scale';
import { useGlobal } from '../context/GlobalContext';

import SVGResizer, { ResizerProps } from './resizer/SVGResizer';

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

  useEffect(() => {
    const x2 = scaleX()(from);
    const x1 = scaleX()(to);
    setPosition({ x1, x2 });
  }, [from, scaleX, to]);

  return (
    <SVGResizer
      position={position}
      onEnd={onEnd}
      parentElement={viewerRef}
      disabled={disabled}
      onMove={(p) => setPosition(p)}
    >
      {children}
    </SVGResizer>
  );
}
