import { Datum1D } from '../../../types/data1d/Datum1D';
import { updateRelatives } from '../integrals/updateRelatives';

import { checkRangeKind } from './checkRangeKind';

export function updateRangesRelativeValues(
  datum: Datum1D,
  forceCalculateIntegral = false,
) {
  updateRelatives(
    datum.ranges,
    'integration',
    checkRangeKind,
    forceCalculateIntegral,
  );
}
