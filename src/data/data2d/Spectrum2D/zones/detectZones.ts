import { mapZones, Zone } from 'nmr-processing';

import {
  DetectionZonesOptions,
  getDetectionZones,
} from './getDetectionZones.js';

export function detectZones(datum, options: DetectionZonesOptions): Zone[] {
  const zones = getDetectionZones(datum, options);

  return mapZones(zones as Zone[], datum);
}
