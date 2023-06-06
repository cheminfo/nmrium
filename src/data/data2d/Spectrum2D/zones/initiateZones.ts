import merge from 'lodash/merge';
import { Spectrum2D } from 'nmr-load-save';
import { Zones } from 'nmr-processing';

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
