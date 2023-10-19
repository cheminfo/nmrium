import merge from 'lodash/merge';
import { Spectrum1D } from 'nmr-load-save';
import { mapPeaks } from 'nmr-processing';

export function initiatePeaks(
  inputSpectrum: Partial<Spectrum1D>,
  spectrum: Spectrum1D,
) {
  return merge({ values: [], options: {} }, inputSpectrum.peaks, {
    values: mapPeaks(inputSpectrum?.peaks?.values || [], spectrum),
  });
}
