import { RangesViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultRangesViewState: RangesViewState = {
  showPeaks: false,
  showMultiplicityTrees: false,
  showRangesIntegrals: true,
  showJGraph: false,
  displayingMode: 'spread',
};

export function useActiveSpectrumRangesViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { ranges },
  } = useChartData();

  if (activeSpectrum?.id && ranges[activeSpectrum?.id]) {
    return ranges[activeSpectrum?.id];
  } else {
    return defaultRangesViewState;
  }
}
