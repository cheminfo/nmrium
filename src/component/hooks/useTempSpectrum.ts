import type { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

export default function useTempSpectrum(defaultValue: any = null) {
  const { tempData } = useChartData();
  const activeSpectrum = useActiveSpectrum();

  return useMemo<Spectrum>(() => {
    if (tempData && activeSpectrum?.id && activeSpectrum?.selected) {
      const datum =
        tempData.find((datum) => datum.id === activeSpectrum.id) ||
        defaultValue;
      return datum;
    }
    return defaultValue;
  }, [activeSpectrum, tempData, defaultValue]);
}
