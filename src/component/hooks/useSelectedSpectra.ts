import type { Spectrum } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.tsx';

import { useActiveSpectra } from './useActiveSpectra.ts';

export function useSelectedSpectra() {
  const activeSpectrum = useActiveSpectra();
  const { data } = useChartData();
  return useMemo<Spectrum[] | null>(() => {
    const spectra = [];

    if (!activeSpectrum || activeSpectrum?.length === 0) return null;

    for (const active of activeSpectrum) {
      const spectrum = data?.[active.index];
      if (spectrum) {
        spectra.push(spectrum);
      }
    }

    return spectra;
  }, [activeSpectrum, data]);
}
