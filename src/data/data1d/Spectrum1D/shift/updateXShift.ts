import { Datum1D } from '../../../types/data1d';

import { getShiftX } from './getShiftX';
import { updateIntegralXShift } from './internal/updateIntegralXShift';
import { updatePeaksXShift } from './internal/updatePeaksXShift';
import { updateRangesXShift } from './internal/updateRangesXShift';

export function updateXShift(datum: Datum1D) {
  const shiftX = getShiftX(datum);
  updatePeaksXShift(datum, shiftX);
  updateRangesXShift(datum, shiftX);
  updateIntegralXShift(datum, shiftX);
}
