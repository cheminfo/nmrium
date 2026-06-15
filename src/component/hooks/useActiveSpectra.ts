import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { getActiveSpectra } from '../reducer/helper/getActiveSpectra.js';

export function useActiveSpectra() {
  const {
    view: { spectra },
  } = useChartData();
  return useMemo(() => getActiveSpectra(spectra), [spectra]);
}
