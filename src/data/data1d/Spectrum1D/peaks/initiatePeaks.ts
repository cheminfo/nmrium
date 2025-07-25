import type { Peaks } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import merge from 'lodash/merge.js';
import { mapPeaks } from 'nmr-processing';

export function initiatePeaks(
  inputSpectrum: Partial<Spectrum1D>,
  spectrum: Spectrum1D,
): Peaks {
  return merge({ values: [], options: {} }, inputSpectrum.peaks, {
    values: mapPeaks(inputSpectrum?.peaks?.values || [], spectrum),
  });
}
