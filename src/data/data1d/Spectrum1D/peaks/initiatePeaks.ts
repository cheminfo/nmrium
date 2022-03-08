import merge from 'lodash/merge';

import { Datum1D, Peaks } from '../../../types/data1d';

import { mapPeaks } from './mapPeaks';

export function initiatePeaks(
  options: Partial<{ peaks: Peaks }>,
  datum: Datum1D,
) {
  return merge(
    { values: [], options: {} },
    options.peaks,
    {
      values: mapPeaks(options?.peaks?.values || [], datum),
    },
  );
}
