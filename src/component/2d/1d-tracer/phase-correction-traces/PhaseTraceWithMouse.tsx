import { useMouseTracker } from '../../../EventsTrackers/MouseTracker.js';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace.js';

export function PhaseTraceWithMouse() {
  const position = useMouseTracker();

  if (!position) {
    return null;
  }

  return <SpectrumPhaseTrace positionUnit="Pixel" position={position} />;
}
