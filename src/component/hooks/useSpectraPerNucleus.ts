import { useMemo } from 'react';

import { Datum1D } from '../../data/data1d/Spectrum1D';
import { Datum2D } from '../../data/data2d/Spectrum2D';
import { useChartData } from '../context/ChartContext';
import nucleusToString from '../utility/nucleusToString';

export default function useSpectraByActiveNucleus() {
  const { data, activeTab } = useChartData();

  return useMemo<Array<Datum1D | Datum2D>>(() => {
    if (data) {
      return (
        data.filter(
          (spectrum) => activeTab === nucleusToString(spectrum.info.nucleus),
        ) || []
      );
    }
    return [];
  }, [activeTab, data]);
}
