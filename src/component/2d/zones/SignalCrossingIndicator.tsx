import type { Spectrum2D } from '@zakodium/nmr-types';
import { isSpectrum2DFt } from '@zakodium/nmrium-core';

import useSpectrum from '../../hooks/useSpectrum.js';
import SignalDeltaLine from '../SignalDeltaLine.js';
import { useNearestSignalCrossing } from '../useNearestSignalCrossing.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

export function SignalCrossingIndicator() {
  const spectrum = useSpectrum();

  if (!isSpectrum2DFt(spectrum) || !spectrum.display.isVisible) return null;

  return (
    <SignalCrossingIndicatorInner linkedSignals={spectrum.linkedSignals} />
  );
}

function SignalCrossingIndicatorInner({
  linkedSignals,
}: Pick<Spectrum2D, 'linkedSignals'>) {
  const { nearest } = useNearestSignalCrossing({ linkedSignals });
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  if (!nearest) return null;

  return (
    <g data-no-export="true" pointerEvents="none">
      <SignalDeltaLine delta={nearest.xDelta} axis="X" show color="#ff0000" />
      <SignalDeltaLine delta={nearest.yDelta} axis="Y" show color="#ff0000" />
      <circle
        cx={scaleX(nearest.xDelta)}
        cy={scaleY(nearest.yDelta)}
        r={10}
        fill="none"
        stroke="#ff0000"
        strokeWidth={2}
        pointerEvents="all"
      />
    </g>
  );
}
