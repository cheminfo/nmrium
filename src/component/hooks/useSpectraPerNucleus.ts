import type { Spectrum } from 'nmrium-core';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';
import nucleusToString from '../utility/nucleusToString.js';

export default function useSpectraByActiveNucleus() {
  const {
    data: spectra,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  return useMemo<Spectrum[]>(() => {
    if (spectra) {
      return (
        spectra.filter(
          (spectrum) => activeTab === nucleusToString(spectrum.info.nucleus),
        ) || []
      );
    }
    return [];
  }, [activeTab, spectra]);
}
