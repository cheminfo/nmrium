import merge from 'lodash/merge';

import { Datum1D, Integrals } from '../../../types/data1d';

import { mapIntegrals } from './mapIntegrals';

export function initiateIntegrals(
  options: Partial<{ integrals: Integrals }>,
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
    options.integrals,
    {
      values: mapIntegrals(options?.integrals?.values || [], datum),
    },
  );
}
