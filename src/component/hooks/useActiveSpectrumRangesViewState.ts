import type { RangesViewState } from 'nmrium-core';

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
  showPublicationString: false,
  showRanges: false,
  publicationStringBounding: { x: 0, y: 0, width: 400, height: 0 },
  rangesBounding: { x: 0, y: 0, width: 200, height: 150 },
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
