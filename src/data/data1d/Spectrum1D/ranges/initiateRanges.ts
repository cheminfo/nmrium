import merge from 'lodash/merge.js';
import type { Ranges } from 'nmr-processing';
import { mapRanges } from 'nmr-processing';
import type { Spectrum1D } from 'nmrium-core';

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
