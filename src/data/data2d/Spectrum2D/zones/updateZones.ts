import { Datum2D } from '../../../types/data2d';

import { mapZones } from './mapZones';

export function updateZones(datum: Datum2D) {
  datum.zones.values = mapZones(datum.zones.values, datum, {
    checkIsExisting: false,
    shiftTarget: 'current',
  });
}
