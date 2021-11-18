import { DatumKind } from '../../../constants/SignalsKinds';
import generateID from '../../../utilities/generateID';
import { getShift } from '../shift/getShift';

import { DetectionZonesOptions, getDetectionZones } from './getDetectionZones';

export function detectZones(datum, options: DetectionZonesOptions) {
  const zones = getDetectionZones(datum, options);
  const { xShift, yShift } = getShift(datum);

  const { minX, maxX, minY, maxY } = datum.data;
  const xError = Math.abs(maxX - minX) / 10000;
  const yError = Math.abs(maxY - minY) / 10000;

  const formattedZones = zones.reduce((acc, zone) => {
    const newXRange = zone.x.fromTo;
    const newYRange = zone.y.fromTo;

    // check if the zone is already exists
    for (const { x, y } of datum.zones.values) {
      if (
        Math.abs(newXRange.from - x.from) < xError &&
        Math.abs(newXRange.to - x.to) < xError &&
        Math.abs(newYRange.from - y.from) < yError &&
        Math.abs(newYRange.to - y.to) < yError
      ) {
        return acc;
      }
    }

    acc.push({
      id: generateID(),
      x: { from: newXRange.from, to: newXRange.to },
      y: { from: newYRange.from, to: newYRange.to },
      signals: [
        {
          id: generateID(),
          peaks: zone.peaks,
          x: {
            originDelta: zone.x.delta - xShift,
            ...zone.x,
          },
          y: {
            originDelta: zone.y.delta - yShift,
            ...zone.y,
          },
          kind: 'signal',
        },
      ],
      kind: DatumKind.signal,
    });

    return acc;
  }, []);

  return formattedZones;
}
