import { Zone } from '../../../types/data2d';

import { DetectionZonesOptions, getDetectionZones } from './getDetectionZones';
import { mapZones } from './mapZones';

/**
 *
 * @param {object} options
 * @param {object} options.selectedZone
 * @param {number} options.selectedZone.fromX
 * @param {number} options.selectedZone.fromY
 * @param {number} options.selectedZone.toX
 * @param {number} options.selectedZone.toY
 * @param {number} options.thresholdFactor
 * @param {boolean} options.convolutionByFFT
 */
export function detectZonesManual(datum, options: DetectionZonesOptions) {
  const zones = getDetectionZones(datum, options);
  return mapZones(zones as Zone[], datum);
}
