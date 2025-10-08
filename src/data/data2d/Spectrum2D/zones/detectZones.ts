import type { Zone } from '@zakodium/nmr-types';
import { mapZones } from 'nmr-processing';

import type { DetectionZonesOptions } from './getDetectionZones.js';
import { getDetectionZones } from './getDetectionZones.js';

export function detectZones(
  datum: any,
  options: DetectionZonesOptions,
): Zone[] {
  const zones = getDetectionZones(datum, options);

  return mapZones(zones as Zone[], datum);
}
