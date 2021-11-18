import { DatumKind } from '../../../constants/SignalsKinds';
import { Zone } from '../../../types/data2d';
import generateID from '../../../utilities/generateID';
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
  const signals = getDetectionZones(datum, options);
  const { xShift, yShift } = getShift(datum);
  const zones: Zone[] = signals.map((signal) => {
    return {
      id: generateID(),
      x: signal.x.fromTo,
      y: signal.y.fromTo,
      signals: [
        {
          id: generateID(),
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
        },
      ],
      kind: DatumKind.signal,
    };
  }, []);

  return zones;
}
