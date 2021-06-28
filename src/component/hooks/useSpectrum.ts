import { useMemo } from 'react';

import { Datum1D } from "../../data/data1d/Spectrum1D";
import { Datum2D } from '../../data/data2d/Spectrum2D';
import { useChartData } from '../context/ChartContext';


export default function useSpectrum(defaultProps: any) {
  const { data, activeSpectrum } = useChartData();

  return useMemo<Datum1D | Datum2D>(() => {
    if (data && activeSpectrum && activeSpectrum.id) {
      const datum =
        data.find((datum) => datum.id === activeSpectrum.id) || defaultProps;
      return datum;
    }
    return defaultProps;
  }, [activeSpectrum, data, defaultProps]);
}
