import { useMemo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import nucleusToString from '../utility/nucleusToString';

export default function useSpectraByActiveNucleus() {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

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
