import { Spectrum2D } from 'nmr-load-save';

import { isNumber } from '../../../utilities/isNumber';

/**
 *
 * @param {number} zoneID
 * @param {object} signal
 * @param {number} signal.x
 * @param {number} signal.y
 * @param {string} signal.id
 */
export function changeZoneSignal(
  spectrum: Spectrum2D,
  zoneID: string,
  signal: { id?: string; deltaX?: number; deltaY?: number },
): { xShift: number; yShift: number } {
  const zoneIndex = spectrum.zones.values.findIndex(
    (zone) => zone.id === zoneID,
  );

  const { id, deltaX, deltaY } = signal;

  if (zoneIndex !== -1) {
    const signalIndex = spectrum.zones.values[zoneIndex].signals.findIndex(
      (s) => s.id === id,
    );

    const zone = spectrum.zones.values[zoneIndex];
    if (signalIndex !== -1) {
      const originalSignal: any = zone.signals[signalIndex];
      const xShift = isNumber(deltaX) ? deltaX - originalSignal.x.delta : 0;
      const yShift = isNumber(deltaY) ? deltaY - originalSignal.y?.delta : 0;

      return { xShift, yShift };
    }
  }
  return { xShift: 0, yShift: 0 };
}
