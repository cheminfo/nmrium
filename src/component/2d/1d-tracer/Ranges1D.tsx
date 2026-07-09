import type { Range } from '@zakodium/nmr-types';

import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.ts';
import { RangeIndicator } from '../../1d-2d/components/RangeIndicator.tsx';
import { useAddMultipletSignal } from '../../hooks/useAddMultipletSignal.tsx';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface Ranges1DProps {
  ranges: Range[];
  orientation: 'horizontal' | 'vertical';
  spectrumId: string;
}

export function Ranges1D(props: Ranges1DProps) {
  const { ranges, orientation, spectrumId } = props;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const scale = orientation === 'horizontal' ? scaleX : scaleY;
  const addMultipletSignal = useAddMultipletSignal();

  return ranges.map((range) => {
    const opacity = getOpacityBasedOnSignalKind(range);

    const { from, to, id } = range;
    const fromInPixel = scale(from);
    const toInPixel = scale(to);
    const start = Math.min(fromInPixel, toInPixel);
    const size = Math.abs(fromInPixel - toInPixel);

    function handleAddSignal(e: React.MouseEvent<SVGGElement, MouseEvent>) {
      const boundingRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - boundingRect.left + start;
      const y = e.clientY - boundingRect.top + start;

      const valueInPixel = orientation === 'horizontal' ? x : y;
      const delta = scale.invert(valueInPixel);
      addMultipletSignal({ range, delta, spectrumId });
    }

    return (
      <RangeIndicator
        orientation={orientation}
        key={id}
        position={start}
        size={size}
        onClick={handleAddSignal}
        opacity={opacity}
      />
    );
  });
}
