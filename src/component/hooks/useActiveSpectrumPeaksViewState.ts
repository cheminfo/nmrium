import type { PeaksViewState } from '@zakodium/nmrium-core';

import { useInsetOptions } from '../1d/inset/InsetProvider.js';
import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

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

  const inset = useInsetOptions();

  if (inset) {
    return inset.view.peaks;
  }

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
