import merge from 'lodash/merge';
import { mapRanges, Ranges, Spectrum1D } from 'nmr-processing';

export function initiateRanges(
  options: Partial<{ ranges: Ranges }>,
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
    options.ranges,
    {
      values: mapRanges(options?.ranges?.values || [], spectrum),
    },
  );
}
