import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xGetFromToIndex } from 'ml-spectra-processing';

import { useChartData } from '../context/ChartContext.js';

import { useSelectedSpectra } from './useSelectedSpectra.ts';

export const MIN_AREA_POINTS = 5;

export function useCheckPointsNumberInWindowArea() {
  const state = useChartData();
  const spectra = useSelectedSpectra();
  const {
    xDomain: [from, to],
  } = state;

  if (spectra && spectra.length > 0) {
    const { fromIndex, toIndex } = xGetFromToIndex(
      (spectra[0] as Spectrum1D).data.x,
      {
        from,
        to,
      },
    );
    return toIndex - fromIndex;
  }

  return 0;
}
