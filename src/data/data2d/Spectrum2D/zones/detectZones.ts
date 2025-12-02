import type { Zone } from '@zakodium/nmr-types';
import type { Spectrum2D } from '@zakodium/nmrium-core';
import { mapZones } from 'nmr-processing';

import type { DetectionZonesOptions } from './getDetectionZones.js';
import { getDetectionZones } from './getDetectionZones.js';

export function detectZones(
  datum: Spectrum2D,
  options: DetectionZonesOptions,
): Zone[] {
  const zones = getDetectionZones(datum, options);

  return mapZones(zones, datum);
}
