import * as Filters from '../../../Filters';
import { Datum2D } from '../../../types/data2d';

export function getShift(datum: Datum2D): { xShift: number; yShift: number } {
  let shift: any = { xShift: 0, yShift: 0 };
  if (datum?.filters) {
    shift = datum.filters.reduce(
      (acc, filter) => {
        if (filter.name === Filters.shift2DX.id) {
          acc.xShift = filter?.flag ? filter.value : 0;
        }
        if (filter.name === Filters.shift2DY.id) {
          acc.yShift = filter?.flag ? filter.value : 0;
        }
        return acc;
      },
      { xShift: 0, yShift: 0 },
    );
  }

  return shift;
}
