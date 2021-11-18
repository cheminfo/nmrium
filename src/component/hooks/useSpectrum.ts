import { useMemo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { Datum2D } from '../../data/types/data2d';
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
