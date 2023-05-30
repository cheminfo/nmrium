import { Spectrum1D , updateRangesRelativeValues } from 'nmr-processing';

import { mapRanges } from './mapRanges';

export function updateRanges(spectrum: Spectrum1D) {
  spectrum.ranges.values = mapRanges(spectrum.ranges.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
  updateRangesRelativeValues(spectrum, true);
}
