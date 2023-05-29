import { Integral, Spectrum1D } from 'nmr-load-save';

import { checkIntegralKind, updateRelatives } from 'nmr-processing';

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
