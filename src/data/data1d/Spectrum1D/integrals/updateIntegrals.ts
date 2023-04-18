import { Spectrum1D } from 'nmr-load-save';

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
