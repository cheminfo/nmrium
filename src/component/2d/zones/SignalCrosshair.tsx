/** @jsxImportSource @emotion/react */

import { useMemo } from 'react';

import { buildID } from '../../../data/utilities/Concatenation';
import { useHighlight } from '../../highlight';
import SignalDeltaLine from '../SignalDeltaLine';

import { SignalType } from './Signal';

interface SignalCrosshairProps {
  signal: SignalType;
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
        delta={signal.x.delta}
        axis="X"
        show={highlightX.isActive}
      />
      <SignalDeltaLine
        delta={signal.y.delta}
        axis="Y"
        show={highlightY.isActive}
      />
    </g>
  );
}

export default SignalCrosshair;
