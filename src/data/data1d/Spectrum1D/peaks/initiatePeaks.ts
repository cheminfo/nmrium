import merge from 'lodash/merge.js';
import type { Spectrum1D } from 'nmr-load-save';
import type { Peaks } from 'nmr-processing';
import { mapPeaks } from 'nmr-processing';

export function initiatePeaks(
  inputSpectrum: Partial<Spectrum1D>,
  spectrum: Spectrum1D,
): Peaks {
  return merge({ values: [], options: {} }, inputSpectrum.peaks, {
    values: mapPeaks(inputSpectrum?.peaks?.values || [], spectrum),
  });
}
