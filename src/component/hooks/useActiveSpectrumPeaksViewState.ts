import { PeaksViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultPeaksViewState: PeaksViewState = {
  showPeaks: true,
  showPeaksShapes: false,
  showPeaksSum: false,
  displayingMode: 'spread',
};

export function useActiveSpectrumPeaksViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { peaks },
  } = useChartData();

  if (
    activeSpectrum?.id &&
    activeSpectrum?.selected &&
    peaks[activeSpectrum?.id]
  ) {
    return peaks[activeSpectrum?.id];
  } else {
    return defaultPeaksViewState;
  }
}
