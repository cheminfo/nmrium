import { Zone } from '../../../types/data2d';

import { DetectionZonesOptions, getDetectionZones } from './getDetectionZones';
import { mapZones } from './mapZones';

export function detectZones(datum, options: DetectionZonesOptions): Zone[] {
  const zones = getDetectionZones(datum, options);

  return mapZones(zones as Zone[], datum);
}
