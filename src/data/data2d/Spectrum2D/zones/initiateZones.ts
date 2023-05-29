import merge from 'lodash/merge';
import type { Spectrum2D, Zones } from 'nmr-processing';

import { mapZones } from './mapZones';

export function initiateZones(
  options: Partial<{ zones: Zones }>,
  spectrum: Spectrum2D,
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
    options.zones,
    {
      values: mapZones(options?.zones?.values || [], spectrum),
    },
  );
}
