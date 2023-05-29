import type { Integral, Spectrum1D } from 'nmr-processing';

import { checkIntegralKind } from './checkIntegralKind';
import { updateRelatives } from './updateRelatives';

export function updateIntegralsRelativeValues(
  spectrum: Spectrum1D,
  forceCalculateIntegral = false,
) {
  updateRelatives<Integral>(
    spectrum.integrals,
    'integral',
    checkIntegralKind,
    forceCalculateIntegral,
  );
}
