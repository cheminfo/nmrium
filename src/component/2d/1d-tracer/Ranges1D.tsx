import type { Range } from '@zakodium/nmr-types';

import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.ts';
import { RangeIndicator } from '../../1d-2d/components/RangeIndicator.tsx';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface Ranges1DProps {
  ranges: Range[];
  orientation: 'horizontal' | 'vertical';
  spectrumId: string;
}

export function Ranges1D(props: Ranges1DProps) {
  const { ranges, orientation } = props;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const scale = orientation === 'horizontal' ? scaleX : scaleY;

  return ranges.map((range) => {
    const opacity = getOpacityBasedOnSignalKind(range);

    const { from, to, id } = range;
    const fromInPixel = scale(from);
    const toInPixel = scale(to);
    const start = Math.min(fromInPixel, toInPixel);
    const size = Math.abs(fromInPixel - toInPixel);

    return (
      <RangeIndicator
        orientation={orientation}
        key={id}
        position={start}
        size={size}
        opacity={opacity}
      />
    );
  });
}
