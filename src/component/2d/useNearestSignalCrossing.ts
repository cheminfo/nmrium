import type { Spectrum2D } from '@zakodium/nmr-types';
import { useMemo } from 'react';

import { useMouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';

import { useTracesSpectra } from './useTracesSpectra.js';
import { extractSpectrumSignals } from './utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from './utilities/scale.js';
import {
  buildCandidates,
  findNearestCrossing,
} from './utilities/signalCrossings.js';

interface UseNearestSignalCrossingOptions extends Pick<
  Spectrum2D,
  'linkedSignals'
> {
  radius?: number;
}

/**
 * Returns the nearest visible crossing within the pixel radius, or null
 */
export function useNearestSignalCrossing({
  linkedSignals,
  radius = 10,
}: UseNearestSignalCrossingOptions) {
  const traces = useTracesSpectra();
  const mouse = useMouseTracker();
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const { width, height, margin, xDomain, yDomain } = useChartData();
  const candidates = useMemo(() => {
    if (!traces.x || !traces.y) return [];

    const signalsX = extractSpectrumSignals(traces.x);
    const signalsY = extractSpectrumSignals(traces.y);
    return buildCandidates({
      xSignals: signalsX,
      ySignals: signalsY,
      linkedSignals,
      domains: { xDomain, yDomain },
    });
  }, [traces.x, traces.y, linkedSignals, xDomain, yDomain]);

  if (
    !mouse ||
    mouse.x < margin.left ||
    mouse.x > width - margin.right ||
    mouse.y < margin.top ||
    mouse.y > height - margin.bottom
  ) {
    return { candidates, nearest: null };
  }

  const nearest = findNearestCrossing(
    mouse,
    candidates,
    { x: scaleX, y: scaleY },
    radius,
  );

  return { candidates, nearest };
}
