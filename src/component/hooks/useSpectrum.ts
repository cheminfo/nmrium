import { useMemo } from 'react';

import { Datum1D } from '../../data/data1d/Spectrum1D';
import { Datum2D } from '../../data/data2d/Spectrum2D';
import { useChartData } from '../context/ChartContext';

export default function useSpectrum(defaultValue: any) {
  const { data, activeSpectrum } = useChartData();

  return useMemo<Datum1D | Datum2D>(() => {
    if (data && activeSpectrum && activeSpectrum.id) {
      const datum =
        data.find((datum) => datum.id === activeSpectrum.id) || defaultValue;
      return datum;
    }
    return defaultValue;
  }, [activeSpectrum, data, defaultValue]);
}
