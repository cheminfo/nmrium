import { v4 } from '@lukeed/uuid';

import { DatumKind } from '../../../constants/SignalsKinds';
import { Zone } from '../../../types/data2d';
import { getShift } from '../shift/getShift';

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
  const zones = getDetectionZones(datum, options);
  const { xShift, yShift } = getShift(datum);
  const formattedZones: Zone[] = zones.map((zone) => {
    const signals = zone.signals.map((signal) => {
      return {
        id: v4(),
        peaks: signal.peaks,
        x: {
          originDelta: signal.x.delta - xShift,
          ...signal.x,
        },
        y: {
          originDelta: signal.y.delta - yShift,
          ...signal.y,
        },
        kind: signal.kind || 'signal',
      };
    });
    return {
      id: v4(),
      x: zone.x,
      y: zone.y,
      signals,
      kind: DatumKind.signal,
    };
  });

  return formattedZones;
}
