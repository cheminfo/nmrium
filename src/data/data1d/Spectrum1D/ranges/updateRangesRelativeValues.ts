import { Spectrum1D } from 'nmr-processing';

import { updateRelatives } from '../integrals/updateRelatives';

import { checkRangeKind } from './checkRangeKind';

export function updateRangesRelativeValues(
  spectrum: Spectrum1D,
  forceCalculateIntegral = false,
) {
  updateRelatives(
    spectrum.ranges,
    'integration',
    checkRangeKind,
    forceCalculateIntegral,
  );
}
