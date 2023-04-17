import { v4 } from '@lukeed/uuid';
import { Peak1D, Spectrum1D } from 'nmr-load-save';

import { MapOptions, ShiftTarget } from '../../../types/common/MapOptions';
import { getShiftX } from '../getShiftX';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';

function isExists(peak: Peak1D, spectrum: Spectrum1D, error) {
  // check if the Peak is already exists
  for (const { x } of spectrum.peaks?.values || []) {
    if (Math.abs(peak.x - x) < error) {
      return true;
    }
  }
  return false;
}

function getPeakDelta(peak: Peak1D, shiftTarget: ShiftTarget, shift: number) {
  const { originalX = 0, x } = peak;
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
  peaks: Peak1D[],
  spectrum: Spectrum1D,
  options: MapOptions = {},
) {
  const { checkIsExisting = true, shiftTarget = 'origin' } = options;
  const shiftX = getShiftX(spectrum);
  const error = getSpectrumErrorValue(spectrum);

  let newPeaks: Peak1D[] = [];

  for (const peak of peaks) {
    const peakDelta = getPeakDelta(peak, shiftTarget, shiftX);

    if (
      !checkIsExisting ||
      (checkIsExisting && !isExists(peak, spectrum, error))
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
