import type { Ranges } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import merge from 'lodash/merge.js';
import { mapRanges } from 'nmr-processing';

export function initiateRanges(
  inputSpectrum: Partial<Spectrum1D>,
  spectrum: Spectrum1D,
  options: Ranges['options'],
) {
  return merge(
    {
      values: [],
      options,
    },
    {
      values: mapRanges(inputSpectrum?.ranges?.values || [], spectrum),
    },
  );
}
