import merge from 'lodash/merge';
import { Spectrum1D, Peaks } from 'nmr-processing';

import { mapPeaks } from './mapPeaks';

export function initiatePeaks(
  options: Partial<{ peaks: Peaks }>,
  spectrum: Spectrum1D,
) {
  return merge({ values: [], options: {} }, options.peaks, {
    values: mapPeaks(options?.peaks?.values || [], spectrum),
  });
}
