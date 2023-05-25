import { Spectrum1D } from 'nmr-processing';

import { updateRangesRelativeValues } from './updateRangesRelativeValues';
import { mapRanges } from 'nmr-processing';

export function updateRanges(spectrum: Spectrum1D) {
  spectrum.ranges.values = mapRanges(spectrum.ranges.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
  updateRangesRelativeValues(spectrum, true);
}
