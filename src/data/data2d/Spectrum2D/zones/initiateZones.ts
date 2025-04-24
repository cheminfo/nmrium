import merge from 'lodash/merge.js';
import type { Zones } from 'nmr-processing';
import { mapZones } from 'nmr-processing';
import type { Spectrum2D } from 'nmrium-core';

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
