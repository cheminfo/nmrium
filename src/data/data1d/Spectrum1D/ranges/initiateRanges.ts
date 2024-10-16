import merge from 'lodash/merge.js';
import { Spectrum1D } from 'nmr-load-save';
import { mapRanges, Ranges } from 'nmr-processing';

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
