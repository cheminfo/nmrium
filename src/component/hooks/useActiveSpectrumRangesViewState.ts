import type { RangesViewState } from 'nmr-load-save';

import { useInsetOptions } from '../1d/inset/InsetProvider.js';
import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

export const defaultRangesViewState: RangesViewState = {
  showPeaks: false,
  showMultiplicityTrees: false,
  showIntegrals: false,
  showIntegralsValues: true,
  showJGraph: false,
  displayingMode: 'spread',
  integralsScaleRatio: 1,
  showAssignmentsLabels: false,
};

export function useActiveSpectrumRangesViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { ranges },
  } = useChartData();

  const inset = useInsetOptions();

  if (inset) {
    return inset.view.ranges;
  }

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
