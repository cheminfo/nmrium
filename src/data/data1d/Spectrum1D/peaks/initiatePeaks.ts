import merge from 'lodash/merge';
import { Spectrum1D } from 'nmr-load-save';
import { Peaks, mapPeaks } from 'nmr-processing';

export function initiatePeaks(
  options: Partial<{ peaks: Peaks }>,
  spectrum: Spectrum1D,
) {
  return merge({ values: [], options: {} }, options.peaks, {
    values: mapPeaks(options?.peaks?.values || [], spectrum),
  });
}
