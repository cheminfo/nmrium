import merge from 'lodash/merge';
import { Spectrum1D } from 'nmr-load-save';
import { Integrals, mapIntegrals } from 'nmr-processing';

export function initiateIntegrals(
  inputSpectrum: Partial<Spectrum1D>,
  spectrum: Spectrum1D,
  options: Integrals['options'],
) {
  return merge(
    {
      values: [],
      options,
    },
    {
      values: mapIntegrals(inputSpectrum?.integrals?.values || [], spectrum),
    },
  );
}
