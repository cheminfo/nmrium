import { Datum2D } from '../../../types/data2d';

/**
 *
 * @param {number} zoneID
 * @param {object} signal
 * @param {number} signal.x
 * @param {number} signal.y
 * @param {string} signal.id
 */
export function changeZoneSignal(
  datum: Datum2D,
  zoneID,
  newSignal,
): { xShift: number; yShift: number } {
  const zoneIndex = datum.zones.values.findIndex((zone) => zone.id === zoneID);
  if (zoneIndex !== -1) {
    const signalIndex = datum.zones.values[zoneIndex].signals.findIndex(
      (s) => s.id === newSignal.id,
    );

    const zone = datum.zones.values[zoneIndex];
    if (signalIndex !== -1) {
      const originalSignal: any = zone.signals[signalIndex];
      const xShift =
        newSignal?.x || newSignal?.x === 0
          ? newSignal.x - originalSignal.x.delta
          : 0;
      const yShift =
        newSignal?.y || newSignal?.y === 0
          ? newSignal.y - originalSignal.y?.delta
          : 0;

      return { xShift, yShift };
    }
  }
  return { xShift: 0, yShift: 0 };
}
