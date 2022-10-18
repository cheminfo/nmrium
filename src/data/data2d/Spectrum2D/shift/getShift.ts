import * as Filters from '../../../Filters';
import { Datum2D } from '../../../types/data2d';

export function getShift(datum: Datum2D): { xShift: number; yShift: number } {
  let shift = { xShift: 0, yShift: 0 };
  if (datum?.filters) {
    for (const filter of datum.filters) {
      if (filter.name === Filters.shift2DX.id) {
        shift.xShift = filter?.flag ? filter.value : 0;
      }
      if (filter.name === Filters.shift2DY.id) {
        shift.yShift = filter?.flag ? filter.value : 0;
      }
    }
  }

  return shift;
}
