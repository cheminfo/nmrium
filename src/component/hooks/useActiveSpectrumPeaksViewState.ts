import { PeaksViewState } from '../../data/types/view-state/PeaksViewState';
import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultPeaksViewState: PeaksViewState = {
  isPeaksVisible: true,
  showPeaksShapes: false,
  showPeaksSum: false,
};

export function useActiveSpectrumPeaksViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { spectra1D },
  } = useChartData();

  if (activeSpectrum?.id && spectra1D[activeSpectrum?.id]?.peaks) {
    return spectra1D[activeSpectrum?.id]?.peaks;
  } else {
    return defaultPeaksViewState;
  }
}
