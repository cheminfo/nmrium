import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import {
  getDefaultSpectra2DViewState,
  ViewSpectra2D,
} from '../reducer/Reducer';

import { useActiveSpectrum } from './useActiveSpectrum';

export function useActiveSpectrum2DViewState(): ViewSpectra2D {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { spectra2D },
  } = useChartData();

  return useMemo(() => {
    if (activeSpectrum?.id && spectra2D?.[activeSpectrum.id]) {
      return spectra2D[activeSpectrum.id];
    } else {
      return getDefaultSpectra2DViewState();
    }
  }, [activeSpectrum?.id, spectra2D]);
}
