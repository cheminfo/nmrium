import { Peak, Datum1D } from '../../../types/data1d';
import generateID from '../../../utilities/generateID';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';
import { getShiftX } from '../shift/getShiftX';

function isExists(peak: Peak, datum: Datum1D, error) {
  // check if the Peak is already exists
  for (const { x } of datum.peaks?.values || []) {
    if (Math.abs(peak.x - x) < error) {
      return true;
    }
  }
  return false;
}

export function mapPeaks(
  peaks: Peak[],
  datum: Datum1D,
  checkPeakExisting = true,
) {
  const shiftX = getShiftX(datum);

  const error = getSpectrumErrorValue(datum);

  let newPeaks: Peak[] = [];

  for (const peak of peaks) {
    if (
      !checkPeakExisting ||
      (checkPeakExisting && !isExists(peak, datum, error))
    ) {
      newPeaks.push({
        ...peak,
        id: peak?.id || generateID(),
        originalX: peak.x - shiftX,
      });
    }
  }

  return newPeaks;
}
