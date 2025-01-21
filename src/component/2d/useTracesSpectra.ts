import type { Spectrum1D } from 'nmr-load-save';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';

export function useTracesSpectra() {
  const {
    data,
    view: {
      spectra: { activeSpectra, activeTab },
    },
  } = useChartData();

  return useMemo(() => {
    const nuclei = activeTab.split(',');

    const traces: Spectrum1D[] = [];
    for (const nucleus of nuclei) {
      const spectra = activeSpectra[nucleus];
      if (spectra?.length === 1) {
        const id = spectra[0].id;
        const spectrum = data.find(
          (datum) =>
            datum.id === id && !datum.info.isFid && datum.info.dimension === 1,
        ) as Spectrum1D;

        if (spectrum) {
          traces.push(spectrum);
        }
      }
    }
    return traces;
  }, [activeTab, data, activeSpectra]);
}
