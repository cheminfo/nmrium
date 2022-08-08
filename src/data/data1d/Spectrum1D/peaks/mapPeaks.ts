import { Peak, Datum1D } from '../../../types/data1d';
import generateID from '../../../utilities/generateID';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';
import { getShiftX } from '../shift/getShiftX';

function checkPeak(peak: Peak, datum: Datum1D, error) {
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
  return peaks.reduce<Peak[]>((acc, newPeak) => {
    // check if the peak is already exists
    if (checkPeakExisting && checkPeak(newPeak, datum, error)) return acc;

    acc.push({
      ...newPeak,
      id: newPeak?.id || generateID(),
      originalX: newPeak.x - shiftX,
      x: newPeak.x,
      y: newPeak.y,
      width: newPeak.width * datum.info.originFrequency,
    });

    return acc;
  }, []);
}
