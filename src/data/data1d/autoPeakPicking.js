import median from 'ml-array-median';
import { xyAutoPeaksPicking } from 'nmr-processing';

import { getShiftX } from '../data1d/Datum1D';
import generateID from '../utilities/generateID';

export default function autoPeakPicking(datum1D, options) {
  const { minMaxRatio, maxNumberOfPeaks, noiseFactor, lookNegative } = options;
  // we calculate the noise but this could be improved
  const noise = median(datum1D.data.re.map((y) => Math.abs(y)));

  const { re, x } = datum1D.data;
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

  return peaks.map((peak) => {
    return {
      id: generateID(),
      originDelta: peak.x - shiftX,
      delta: peak.x,
      intensity: peak.y,
      width: peak.width,
    };
  });
}
