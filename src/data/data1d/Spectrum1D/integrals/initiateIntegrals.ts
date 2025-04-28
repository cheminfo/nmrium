import type { Spectrum1D } from '@zakodium/nmrium-core';
import merge from 'lodash/merge.js';
import type { Integrals } from 'nmr-processing';
import { mapIntegrals } from 'nmr-processing';

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
