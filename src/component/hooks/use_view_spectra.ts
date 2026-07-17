import type { Spectrum } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { getViewSpectra } from '../../data/get_view_spectra.ts';
import { useChartData } from '../context/ChartContext.tsx';

/**
 * Return all spectra (memoized), with `spectrumLiveProcessed` replacing the related spectrum in data.
 */
export function useViewSpectra() {
  const { data, spectrumLiveProcessed } = useChartData();

  return useMemo(() => {
    return getViewSpectra<Spectrum>({ data, spectrumLiveProcessed });
  }, [data, spectrumLiveProcessed]);
}
