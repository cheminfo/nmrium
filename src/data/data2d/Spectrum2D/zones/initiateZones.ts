import merge from 'lodash/merge';

import { Datum2D, Zones } from '../../../types/data2d';

import { mapZones } from './mapZones';

export function initiateZones(
  options: Partial<{ zones: Zones }>,
  datum: Datum2D,
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
      values: mapZones(options?.zones?.values || [], datum),
    },
  );
}
