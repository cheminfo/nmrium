import median from 'ml-array-median';
import { xyAutoPeaksPicking } from 'nmr-processing';

import generateID from '../utilities/generateID';

import { getShiftX } from './Spectrum1D';

export default function autoPeakPicking(datum1D, options) {
  const {
    minMaxRatio,
    maxNumberOfPeaks,
    noiseFactor,
    lookNegative,
    windowFromIndex,
    windowToIndex,
  } = options;
  // we calculate the noise but this could be improved
  const noise = median(datum1D.data.re.map((y) => Math.abs(y)));

  let { re, x } = datum1D.data;

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  let peaks = xyAutoPeaksPicking(
    { x, y: re },
    {
      lookNegative,
      noiseLevel: noise * noiseFactor,
      minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      maxCriteria: true,
      smoothY: false,
      sgOptions: { windowSize: 15, polynomial: 3 },
    },
  );
  peaks.sort((a, b) => b.y - a.y);
  if (maxNumberOfPeaks < peaks.length) peaks = peaks.slice(0, maxNumberOfPeaks);

  const shiftX = getShiftX(datum1D);

  const error = (x[x.length - 1] - x[0]) / 10000;

  return peaks.reduce((acc, newPeak) => {
    // check if the peak is already exists
    for (const { delta } of datum1D.peaks.values) {
      if (Math.abs(newPeak.x - delta) < error) {
        return acc;
      }
    }

    acc.push({
      id: generateID(),
      originDelta: newPeak.x - shiftX,
      delta: newPeak.x,
      intensity: newPeak.y,
      width: newPeak.width,
    });

    return acc;
  }, []);
}
