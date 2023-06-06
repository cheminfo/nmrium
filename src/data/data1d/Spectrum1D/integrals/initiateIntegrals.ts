import merge from 'lodash/merge';
import { Spectrum1D } from 'nmr-load-save';
import { Integrals } from 'nmr-processing';

import { mapIntegrals } from './mapIntegrals';

export function initiateIntegrals(
  options: Partial<{ integrals: Integrals }>,
  spectrum: Spectrum1D,
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
      values: mapIntegrals(options?.integrals?.values || [], spectrum),
    },
  );
}
