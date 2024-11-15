import type { Spectrum2D } from 'nmr-load-save';
import { Filters2D } from 'nmr-processing';

export interface Shift2D {
  x: number;
  y: number;
}

export function getShift(spectrum: Spectrum2D): Shift2D {
  const shift = { x: 0, y: 0 };
  if (spectrum?.filters) {
    for (const filter of spectrum.filters) {
      if (filter.name === Filters2D.shift2DX.name) {
        shift.x = filter?.enabled ? filter.value.shift : 0;
      }
      if (filter.name === Filters2D.shift2DY.name) {
        shift.y = filter?.enabled ? filter.value.shift : 0;
      }
    }
  }

  return shift;
}
