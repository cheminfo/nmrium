import merge from 'lodash/merge';

import { Integrals } from '../../../types/data1d';

export function initiateIntegrals(options: Partial<{ integrals: Integrals }>) {
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
  );
}
