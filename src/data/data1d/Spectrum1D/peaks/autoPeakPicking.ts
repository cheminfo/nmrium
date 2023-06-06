import median from 'ml-array-median';
import { Spectrum1D } from 'nmr-load-save';
import { Peak1D, xyAutoPeaksPicking, mapPeaks } from 'nmr-processing';

export function autoPeakPicking(spectrum: Spectrum1D, options) {
  const {
    minMaxRatio,
    maxNumberOfPeaks,
    noiseFactor,
    direction,
    windowFromIndex,
    windowToIndex,
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
      shape: { kind: 'lorentzian' },
      noiseLevel: noise * noiseFactor,
      minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      smoothY: false,
    },
  );

  peaks.sort((a, b) => b.y - a.y);
  if (maxNumberOfPeaks < peaks.length) peaks = peaks.slice(0, maxNumberOfPeaks);
  return mapPeaks(peaks as Peak1D[], spectrum);
}
