import type { Zones } from '@zakodium/nmr-types';
import type { Spectrum2D } from '@zakodium/nmrium-core';
import merge from 'lodash/merge.js';
import { mapZones } from 'nmr-processing';

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
