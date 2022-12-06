import { Datum1D } from '../../../types/data1d';

import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

export function updateRanges(datum: Datum1D) {
  datum.ranges.values = mapRanges(datum.ranges.values, datum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
  updateRangesRelativeValues(datum, true);
}
