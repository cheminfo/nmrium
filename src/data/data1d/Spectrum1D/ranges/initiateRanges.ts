import merge from 'lodash/merge';

import { Datum1D, Ranges } from '../../../types/data1d';

import { mapRanges } from './mapRanges';

export function initiateRanges(
  options: Partial<{ ranges: Ranges }>,
  datum: Datum1D,
) {
  return merge(
    {
      values: [],
      options: {
        sum: undefined,
        isSumConstant: true,
        sumAuto: true,
      },
    },
    options.ranges,
    {
      values: mapRanges(options?.ranges?.values || [], datum),
    },
  );
}
