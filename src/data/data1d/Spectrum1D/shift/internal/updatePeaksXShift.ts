import { xFindClosestIndex } from 'ml-spectra-processing';

import { Datum1D, Peak } from '../../../../types/data1d';

export function updatePeaksXShift(datum: Datum1D, shiftValue: number) {
  datum.peaks.values = datum.peaks.values.map<Peak>((peak) => {
    const delta = peak.originalX + shiftValue;
    const xIndex = xFindClosestIndex(datum.data.x, delta);
    return {
      ...peak,
      y: datum.data.re[xIndex],
      x: peak.originalX + shiftValue,
    };
  });
}
