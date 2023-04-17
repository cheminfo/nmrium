import { Spectrum1D } from 'nmr-load-save';

import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

export function updateRanges(spectrum: Spectrum1D) {
  spectrum.ranges.values = mapRanges(spectrum.ranges.values, spectrum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
  updateRangesRelativeValues(spectrum, true);
}
