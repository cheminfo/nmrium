import type { Spectrum1D } from 'nmr-processing';

import { mapIntegrals } from './mapIntegrals';
import { updateIntegralsRelativeValues } from './updateIntegralsRelativeValues';

export function updateIntegrals(spectrum: Spectrum1D) {
  spectrum.integrals.values = mapIntegrals(
    spectrum.integrals.values,
    spectrum,
    'current',
  );
  updateIntegralsRelativeValues(spectrum, true);
}
