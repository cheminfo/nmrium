import { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export default function useSpectrum(defaultValue: any = null) {
  const { data } = useChartData();
  const activeSpectrum = useActiveSpectrum();

  return useMemo<Spectrum>(() => {
    if (data && activeSpectrum?.id && activeSpectrum?.selected) {
      const datum =
        data.find((datum) => datum.id === activeSpectrum.id) || defaultValue;
      return datum;
    }
    return defaultValue;
  }, [activeSpectrum, data, defaultValue]);
}
