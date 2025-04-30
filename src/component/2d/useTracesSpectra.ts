import type {
  ActiveSpectrum,
  Spectrum,
  Spectrum1D,
} from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';

export interface GetTracesSpectraOptions {
  nuclei: string[];
  activeSpectra: Record<string, ActiveSpectrum[] | null>;
  spectra: Spectrum[];
}

export function getTracesSpectra(options: GetTracesSpectraOptions) {
  const { nuclei, activeSpectra, spectra } = options;

  const traces: Spectrum1D[] = [];
  for (const nucleus of nuclei) {
    const traceSpectra = activeSpectra[nucleus];
    if (traceSpectra?.length === 1) {
      const id = traceSpectra[0].id;
      const spectrum = spectra.find(
        (datum) =>
          datum.id === id && !datum.info.isFid && datum.info.dimension === 1,
      ) as Spectrum1D;

      if (spectrum) {
        traces.push(spectrum);
      }
    }
  }
  return traces;
}

export function useTracesSpectra() {
  const {
    data: spectra,
    view: {
      spectra: { activeSpectra, activeTab },
    },
  } = useChartData();

  return useMemo(() => {
    const nuclei = activeTab.split(',');
    return getTracesSpectra({ nuclei, spectra, activeSpectra });
  }, [activeTab, spectra, activeSpectra]);
}
