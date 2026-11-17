import type { Spectrum2D } from '@zakodium/nmr-types';
import { isSpectrum2DFt } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { ShareDataProvider } from '../../context/ShareDataContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useTracesSpectra } from '../useTracesSpectra.js';
import { extractSpectrumSignals } from '../utilities/extractSpectrumSignals.js';
import { getLinkedSignalPositions } from '../utilities/signalCrossings.js';

import { LinkedSignal } from './LinkedSignal.js';
import { SignalCrossingIndicator } from './SignalCrossingIndicator.js';

export function LinkedSignals() {
  const spectrum = useSpectrum();
  if (!isSpectrum2DFt(spectrum) || !spectrum.display.isVisible) return null;

  return (
    <ShareDataProvider>
      <LinkedSignalsInner linkedSignals={spectrum.linkedSignals} />
    </ShareDataProvider>
  );
}

function LinkedSignalsInner({
  linkedSignals,
}: Pick<Spectrum2D, 'linkedSignals'>) {
  const traces = useTracesSpectra();
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const signals = useMemo(() => {
    if (!traces.x || !traces.y) return [];

    return getLinkedSignalPositions({
      xSignals: extractSpectrumSignals(traces.x),
      ySignals: extractSpectrumSignals(traces.y),
      linkedSignals,
    });
  }, [traces.x, traces.y, linkedSignals]);

  return (
    <g className="2d-linked-signals">
      {signals.map((signal) => (
        <LinkedSignal
          key={`${signal.xSignalId}:${signal.ySignalId}`}
          signal={signal}
        />
      ))}
      {selectedTool === 'signalLinking' && (
        <SignalCrossingIndicator linkedSignals={linkedSignals} />
      )}
    </g>
  );
}
