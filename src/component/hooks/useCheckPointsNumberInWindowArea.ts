import { xGetFromToIndex } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import useSpectrum from './useSpectrum';

export const MIN_AREA_POINTS = 5 as const;

export function useCheckPointsNumberInWindowArea() {
  const state = useChartData();
  const spectrum = useSpectrum(null);
  const {
    xDomain: [from, to],
  } = state;

  if (spectrum) {
    const { fromIndex, toIndex } = xGetFromToIndex(
      (spectrum as Spectrum1D).data.x,
      {
        from,
        to,
      },
    );
    return toIndex - fromIndex;
  }

  return 0;
}
