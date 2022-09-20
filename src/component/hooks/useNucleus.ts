import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

export default function useNucleus() {
  const {
    view: {
      spectra: { activeSpectra },
    },
  } = useChartData();
  return useMemo<Array<string>>(() => {
    if (activeSpectra && Object.keys(activeSpectra).length > 0) {
      return Object.keys(activeSpectra);
    }
    return [];
  }, [activeSpectra]);
}
