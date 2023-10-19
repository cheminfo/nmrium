import { Zone, mapZones } from 'nmr-processing';

import { DetectionZonesOptions, getDetectionZones } from './getDetectionZones';

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
  const { spectralWidth, originFrequency } = datum.info;
  options.tolerances = spectralWidth.map((sw, i) => sw * originFrequency[i]);
  const zones = getDetectionZones(datum, options);
  let { fromX, fromY, toX, toY } = options.selectedZone;
  if (fromX > toX) [fromX, toX] = [toX, fromX];
  if (fromX > toX) [fromY, toY] = [toY, fromY];
  zones[0] = {
    ...zones[0],
    x: { from: fromX, to: toX },
    y: { from: fromY, to: toY },
  };
  return mapZones(zones as Zone[], datum);
}
