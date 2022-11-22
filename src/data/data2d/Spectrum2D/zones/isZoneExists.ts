import { Datum2D, Zone } from '../../../types/data2d';
import { Zone2DError } from '../get2DSpectrumErrorValue';

export function isZoneExists(zone: Zone, datum: Datum2D, error: Zone2DError) {
  const newXRange = zone.x || { from: 0, to: 0 };
  const newYRange = zone.y || { from: 0, to: 0 };
  for (const { x, y } of datum.zones.values) {
    if (
      Math.abs(newXRange.from - x.from) < error.x &&
      Math.abs(newXRange.to - x.to) < error.x &&
      Math.abs(newYRange.from - y.from) < error.y &&
      Math.abs(newYRange.to - y.to) < error.y
    ) {
      return true;
    }
  }
  return false;
}
