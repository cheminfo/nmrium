import { RangesViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultRangesViewState: RangesViewState = {
  showPeaks: false,
  showMultiplicityTrees: false,
  showIntegrals: false,
  showIntegralsValues: true,
  showJGraph: false,
  displayingMode: 'spread',
  integralsScaleRatio: 1,
};

export function useActiveSpectrumRangesViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { ranges },
  } = useChartData();

  if (
    activeSpectrum?.id &&
    activeSpectrum?.selected &&
    ranges[activeSpectrum?.id]
  ) {
    return ranges[activeSpectrum?.id];
  } else {
    return defaultRangesViewState;
  }
}
