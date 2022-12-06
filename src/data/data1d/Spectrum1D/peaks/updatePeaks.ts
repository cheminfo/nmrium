import { Datum1D } from '../../../types/data1d';

import { mapPeaks } from './mapPeaks';

export function updatePeaks(datum: Datum1D) {
  datum.peaks.values = mapPeaks(datum.peaks.values, datum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
}
