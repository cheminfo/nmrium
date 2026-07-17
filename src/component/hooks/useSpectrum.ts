import type { Spectrum } from '@zakodium/nmrium-core';

import { useChartData } from '../context/ChartContext.js';

import { useSpectrumWithDataSource } from './useSpectrumWithDataSource.js';
import { useViewSpectra } from './use_view_spectra.ts';

export default function useSpectrum<Default>(
  defaultValue: Default,
): Spectrum | Default;
export default function useSpectrum(): Spectrum | undefined;
export default function useSpectrum<Default>(defaultValue?: Default) {
  const data = useViewSpectra();

  return useSpectrumWithDataSource(data, defaultValue);
}

/**
 * Get active spectrum for live update processing
 */
export function useStableSpectrum() {
  const { data } = useChartData();

  return useSpectrumWithDataSource(data) ?? undefined;
}
