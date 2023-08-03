import { PeaksViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultPeaksViewState: PeaksViewState = {
  isPeaksVisible: true,
  showPeaksShapes: false,
  showPeaksSum: false,
  displayingMode: 'group',
};

export function useActiveSpectrumPeaksViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { peaks },
  } = useChartData();

  if (activeSpectrum?.id && peaks[activeSpectrum?.id]) {
    return peaks[activeSpectrum?.id];
  } else {
    return defaultPeaksViewState;
  }
}
