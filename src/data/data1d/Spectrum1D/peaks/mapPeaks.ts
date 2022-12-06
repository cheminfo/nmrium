import { v4 } from '@lukeed/uuid';

import { MapOptions, ShiftTarget } from '../../../types/common/MapOptions';
import { Peak, Datum1D } from '../../../types/data1d';
import { getShiftX } from '../getShiftX';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';

function isExists(peak: Peak, datum: Datum1D, error) {
  // check if the Peak is already exists
  for (const { x } of datum.peaks?.values || []) {
    if (Math.abs(peak.x - x) < error) {
      return true;
    }
  }
  return false;
}

function getPeakDelta(peak: Peak, shiftTarget: ShiftTarget, shift: number) {
  const { originalX, x } = peak;
  if (shiftTarget === 'origin') {
    return {
      originalX: x - shift,
      x,
    };
  } else {
    return {
      originalX,
      x: originalX + shift,
    };
  }
}

export function mapPeaks(
  peaks: Peak[],
  datum: Datum1D,
  options: MapOptions = {},
) {
  const { checkIsExisting = true, shiftTarget = 'origin' } = options;
  const shiftX = getShiftX(datum);
  const error = getSpectrumErrorValue(datum);

  let newPeaks: Peak[] = [];

  for (const peak of peaks) {
    const peakDelta = getPeakDelta(peak, shiftTarget, shiftX);

    if (
      !checkIsExisting ||
      (checkIsExisting && !isExists(peak, datum, error))
    ) {
      newPeaks.push({
        ...peak,
        id: peak?.id || v4(),
        ...peakDelta,
      });
    }
  }

  return newPeaks;
}
