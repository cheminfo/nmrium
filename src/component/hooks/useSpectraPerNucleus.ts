import type { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.js';
import nucleusToString from '../utility/nucleusToString.js';

export default function useSpectraByActiveNucleus() {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  return useMemo<Spectrum[]>(() => {
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
