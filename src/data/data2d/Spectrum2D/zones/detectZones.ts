import { Zone, mapZones } from 'nmr-processing';

import { DetectionZonesOptions, getDetectionZones } from './getDetectionZones';

export function detectZones(datum, options: DetectionZonesOptions): Zone[] {
  const zones = getDetectionZones(datum, options);

  return mapZones(zones as Zone[], datum);
}
