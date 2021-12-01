import { xFindClosestIndex } from 'ml-spectra-processing';

import { Datum1D } from '../../../../types/data1d';

export function updatePeaksXShift(datum: Datum1D, shiftValue: number) {
  datum.peaks.values = datum.peaks.values.map((peak) => {
    const delta = peak.originDelta + shiftValue;
    const xIndex = xFindClosestIndex(datum.data.x, delta);
    return {
      ...peak,
      intensity: datum.data.re[xIndex],
      delta: peak.originDelta + shiftValue,
    };
  });
}
