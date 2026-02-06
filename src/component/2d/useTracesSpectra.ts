import type {
  ActiveSpectrum,
  Spectrum1D,
  Spectrum,
} from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { isFt1DSpectrum } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useChartData } from '../context/ChartContext.js';

export interface GetTracesSpectraOptions {
  nuclei: string[];
  activeSpectra: Record<string, ActiveSpectrum[] | null>;
  spectra: Spectrum[];
}

export type Spectrum1DTraces = Record<'x' | 'y', Spectrum1D | null>;

const defaultEmptyTraces = { x: null, y: null };

export function getTracesSpectra(options: GetTracesSpectraOptions) {
  const { nuclei, activeSpectra, spectra } = options;

  if (nuclei.length !== 2) {
    throw new Error(
      'Invalid function call: this function should only run in a 2D nucleus context.',
    );
  }

  const traces: Spectrum1DTraces = { ...defaultEmptyTraces };
  let index = 0;
  for (const nucleus of nuclei) {
    const traceSpectra = activeSpectra[nucleus];

    if (traceSpectra?.length !== 1) {
      index++;
      continue;
    }

    const id = traceSpectra[0].id;
    const spectrum = spectra.find((datum) => datum.id === id);
    const key = index === 0 ? 'x' : 'y';
    traces[key] = isFt1DSpectrum(spectrum) ? spectrum : null;

    index++;
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
    const nuclei = activeTab?.split(',');
    if (nuclei?.length !== 2) {
      return { ...defaultEmptyTraces };
    }

    return getTracesSpectra({ nuclei, spectra, activeSpectra });
  }, [activeTab, spectra, activeSpectra]);
}
