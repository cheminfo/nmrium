import { Integral, Spectrum1D , checkIntegralKind, updateRelatives } from 'nmr-processing';


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
