import merge from 'lodash/merge';
import { Spectrum1D } from 'nmr-load-save';
import { Integrals, mapIntegrals } from 'nmr-processing';

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
