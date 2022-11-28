import median from 'ml-array-median';
import { xyAutoPeaksPicking } from 'nmr-processing';

import { Datum1D, Peak } from '../../../types/data1d';

import { mapPeaks } from './mapPeaks';

export function autoPeakPicking(datum1D: Datum1D, options) {
  const {
    minMaxRatio,
    maxNumberOfPeaks,
    noiseFactor,
    direction,
    windowFromIndex,
    windowToIndex,
  } = options;
  // we calculate the noise but this could be improved
  const noise = median(datum1D.data.re.map((y) => Math.abs(y)));

  let { re, x } = datum1D.data;
  const { originFrequency: frequency } = datum1D.info;

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  let peaks = xyAutoPeaksPicking(
    { x, y: re },
    {
      frequency,
      direction,
      shape: { kind: 'lorentzian' },
      noiseLevel: noise * noiseFactor,
      minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      smoothY: false,
    },
  );

  peaks.sort((a, b) => b.y - a.y);
  if (maxNumberOfPeaks < peaks.length) peaks = peaks.slice(0, maxNumberOfPeaks);
  return mapPeaks(peaks as Peak[], datum1D);
}
