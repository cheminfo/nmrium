import { Datum1D, Integral } from '../../../types/data1d';

import { checkIntegralKind } from './checkIntegralKind';
import { updateRelatives } from './updateRelatives';

export function updateIntegralsRelativeValues(
  datum: Datum1D,
  forceCalculateIntegral = false,
) {
  updateRelatives<Integral>(
    datum.integrals,
    'integral',
    checkIntegralKind,
    forceCalculateIntegral,
  );
}
