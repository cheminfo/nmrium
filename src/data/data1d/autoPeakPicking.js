import median from 'ml-array-median';
import { autoPeaksPicking } from 'nmr-processing';

import generateID from '../utilities/generateID';

export default function autoPeakPicking(datum1D, options) {
  const { minMaxRatio, maxNumberOfPeaks, noiseFactor } = options;
  // we calculate the noise but this could be improved
  let noise = median(datum1D.data.re.map((y) => Math.abs(y)));

  let { re, x } = datum1D.data;
  let peaks = autoPeaksPicking(
    { x, y: re },
    {
      noiseLevel: noise * noiseFactor,
      minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      maxCriteria: true,
      smoothY: false,
      sgOptions: { windowSize: 15, polynomial: 3 },
    },
  );
    console.log('data', peaks.slice());
  peaks.sort((a, b) => b.y - a.y);
  console.log(maxNumberOfPeaks, peaks.length);
  console.log(peaks)
  if (maxNumberOfPeaks < peaks.length) peaks = peaks.slice(0, maxNumberOfPeaks);

  return peaks.map((peak) => {
    return {
      id: generateID(),
      xIndex: peak.index,
      intensity: peak.y,
      width: peak.width,
      xShift: datum1D.data.x[peak.index] - peak.x,
    };
  });
}
