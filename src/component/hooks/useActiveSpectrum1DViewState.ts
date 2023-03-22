import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import {
  ViewSpectra1D,
  getDefaultSpectra1DViewState,
} from '../reducer/Reducer';

import { useActiveSpectrum } from './useActiveSpectrum';

export function useActiveSpectrum1DViewState(): ViewSpectra1D {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { spectra1D },
  } = useChartData();
  return useMemo(() => {
    if (activeSpectrum?.id && spectra1D?.[activeSpectrum.id]) {
      return spectra1D[activeSpectrum.id];
    } else {
      return getDefaultSpectra1DViewState();
    }
  }, [activeSpectrum?.id, spectra1D]);
}
