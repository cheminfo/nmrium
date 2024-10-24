import type { Spectrum2D } from 'nmr-load-save';
import type { Zone } from 'nmr-processing';

import type { Zone2DError } from '../get2DSpectrumErrorValue.js';

export function isZoneExists(
  zone: Zone,
  spectrum: Spectrum2D,
  error: Zone2DError,
) {
  const newXRange = zone.x || { from: 0, to: 0 };
  const newYRange = zone.y || { from: 0, to: 0 };

  if (!spectrum.zones?.values) return false;

  for (const { x, y } of spectrum.zones.values) {
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
