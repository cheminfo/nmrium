import type { Peak1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import median from 'ml-array-median';
import type { OptionsXYAutoPeaksPicking } from 'nmr-processing';
import { mapPeaks, xyAutoPeaksPicking } from 'nmr-processing';

import { DEFAULT_PEAK_SHAPE } from '../../../constants/defaultPeakShape.ts';

interface AutoPeakPickingOptions {
  maxNumberOfPeaks: number;
  minMaxRatio: number;
  noiseFactor: number;
  direction?: OptionsXYAutoPeaksPicking['direction'];
  windowFromIndex?: number;
  windowToIndex?: number;
  defaultPeakShape?: Peak1D['shape'];
}

export function autoPeakPicking(
  spectrum: Spectrum1D,
  options: AutoPeakPickingOptions,
) {
  const {
    maxNumberOfPeaks,
    minMaxRatio,
    noiseFactor,
    direction,
    windowFromIndex,
    windowToIndex,
    defaultPeakShape = DEFAULT_PEAK_SHAPE,
  } = options;
  // we calculate the noise but this could be improved
  const noise = median(spectrum.data.re.map((y) => Math.abs(y)));

  let { re, x } = spectrum.data;
  const { originFrequency: frequency } = spectrum.info;

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  let peaks = xyAutoPeaksPicking(
    { x, y: re },
    {
      frequency,
      direction,
      sensitivity: 100,
      shape: defaultPeakShape,
      noiseLevel: noise * noiseFactor,
      minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      smoothY: false,
    },
  );

  peaks.sort((a, b) => b.y - a.y);
  if (maxNumberOfPeaks < peaks.length) peaks = peaks.slice(0, maxNumberOfPeaks);
  return mapPeaks(peaks, spectrum);
}
