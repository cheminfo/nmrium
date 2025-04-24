import merge from 'lodash/merge.js';
import type { Integrals } from 'nmr-processing';
import { mapIntegrals } from 'nmr-processing';
import type { Spectrum1D } from 'nmrium-core';

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
