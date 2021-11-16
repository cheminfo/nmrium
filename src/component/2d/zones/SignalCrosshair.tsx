/** @jsxImportSource @emotion/react */

import { useMemo } from 'react';

import { Signal2D } from '../../../data/types/data2d';
import { buildID } from '../../../data/utilities/Concatenation';
import { useHighlight } from '../../highlight';
import SignalDeltaLine from '../SignalDeltaLine';

interface SignalCrosshairProps {
  signal: Signal2D;
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
  const highlight = useHighlight([signal.id]);

  if (!signal?.x?.delta || !signal?.y?.delta) return null;

  return (
    <g>
      <SignalDeltaLine
        delta={signal.x.delta}
        axis="X"
        show={highlightX.isActive || highlight.isActive}
      />
      <SignalDeltaLine
        delta={signal.y.delta}
        axis="Y"
        show={highlightY.isActive || highlight.isActive}
      />
    </g>
  );
}

export default SignalCrosshair;
