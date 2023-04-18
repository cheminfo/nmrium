import { Integral, Spectrum1D } from 'nmr-load-save';

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
