import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

export default function useNucleus() {
  const { tabActiveSpectrum } = useChartData();
  return useMemo<Array<string>>(() => {
    if (tabActiveSpectrum && Object.keys(tabActiveSpectrum).length > 0) {
      return Object.keys(tabActiveSpectrum);
    }
    return [];
  }, [tabActiveSpectrum]);
}
