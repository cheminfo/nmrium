import type { Spectrum } from '@zakodium/nmrium-core';

import { useChartData } from '../context/ChartContext.js';

import { useSpectrumWithDataSource } from './useSpectrumWithDataSource.js';

export default function useSpectrum<Default>(
  defaultValue: Default,
): Spectrum | Default;
export default function useSpectrum(): Spectrum | undefined;
export default function useSpectrum<Default>(defaultValue?: Default) {
  const { data } = useChartData();
  return useSpectrumWithDataSource(data, defaultValue);
}

/**
 * return the first active spectrum from tempData if available, otherwise from data
 *
 * @param defaultValue
 */
export function useViewSpectrum<Default>(
  defaultValue: Default,
): Spectrum | Default;
export function useViewSpectrum(): Spectrum | undefined;
export function useViewSpectrum<Default>(defaultValue?: Default) {
  const { data, tempData } = useChartData();
  return useSpectrumWithDataSource(tempData ?? data, defaultValue);
}
