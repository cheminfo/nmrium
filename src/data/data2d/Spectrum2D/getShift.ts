import { Spectrum2D } from 'nmr-load-save';
import { Filters } from 'nmr-processing';

export interface Shift2D {
  x: number;
  y: number;
}

export function getShift(spectrum: Spectrum2D): Shift2D {
  const shift = { x: 0, y: 0 };
  if (spectrum?.filters) {
    for (const filter of spectrum.filters) {
      if (filter.name === Filters.shift2DX.id) {
        shift.x = filter?.flag ? filter.value.shift : 0;
      }
      if (filter.name === Filters.shift2DY.id) {
        shift.y = filter?.flag ? filter.value.shift : 0;
      }
    }
  }

  return shift;
}
