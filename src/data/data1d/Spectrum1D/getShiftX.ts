import * as FiltersTypes from '../../Filters';
import { Datum1D } from '../../types/data1d/Datum1D';

export function getShiftX(datum: Datum1D): number {
  const filter =
    datum?.filters &&
    datum?.filters.find((filter) => filter.name === FiltersTypes.shiftX.id);

  return filter?.flag ? filter.value : 0;
}
