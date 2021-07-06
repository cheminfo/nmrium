/** @jsxImportSource @emotion/react */

import { useMemo } from 'react';

import { Signal as SignalDataProps } from '../../../data/data2d/Spectrum2D';
import { buildID } from '../../../data/utilities/Concatenation';
import { useHighlight } from '../../highlight';
import SignalDeltaLine from '../SignalDeltaLine';

interface SignalCrosshairProps {
  signal: SignalDataProps;
}

function SignalCrosshair({ signal }: SignalCrosshairProps) {
  const highlightIDsX = useMemo(() => {
    return [buildID(signal.id, 'Crosshair'), buildID(signal.id, 'Crosshair_X')];
  }, [signal.id]);

  const highlightIDsY = useMemo(() => {
    return [buildID(signal.id, 'Crosshair'), buildID(signal.id, 'Crosshair_Y')];
  }, [signal.id]);

  const highlightX = useHighlight(highlightIDsX);
  const highlightY = useHighlight(highlightIDsY);

  return (
    <g>
      <SignalDeltaLine
        delta={signal.x.delta as any}
        axis="X"
        show={highlightX.isActive}
      />
      <SignalDeltaLine
        delta={signal.y.delta as any}
        axis="Y"
        show={highlightY.isActive}
      />
    </g>
  );
}

export default SignalCrosshair;
