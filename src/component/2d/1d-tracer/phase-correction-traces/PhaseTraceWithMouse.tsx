import { useMouseTracker } from '../../../EventsTrackers/MouseTracker';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';

export function PhaseTraceWithMouse() {
  const position = useMouseTracker();

  if (!position) {
    return null;
  }

  return <SpectrumPhaseTrace positionUnit="Pixel" position={position} />;
}
