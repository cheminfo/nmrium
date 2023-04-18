import { Spectrum1D } from 'nmr-load-save';

import { mapPeaks } from './mapPeaks';

export function updatePeaks(spectrum: Spectrum1D) {
  spectrum.peaks.values = mapPeaks(spectrum.peaks.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
}
