import * as Filters from '../../Filters';
import { Datum2D } from '../../types/data2d';

export interface Shift2D {
  x: number;
  y: number;
}

export function getShift(datum: Datum2D): Shift2D {
  let shift = { x: 0, y: 0 };
  if (datum?.filters) {
    for (const filter of datum.filters) {
      if (filter.name === Filters.shift2DX.id) {
        shift.x = filter?.flag ? filter.value : 0;
      }
      if (filter.name === Filters.shift2DY.id) {
        shift.y = filter?.flag ? filter.value : 0;
      }
    }
  }

  return shift;
}
