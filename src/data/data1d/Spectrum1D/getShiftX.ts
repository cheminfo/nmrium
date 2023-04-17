import { Spectrum1D } from 'nmr-load-save';

import * as FiltersTypes from '../../Filters';

export function getShiftX(spectrum: Spectrum1D): number {
  const filter =
    spectrum?.filters &&
    spectrum?.filters.find((filter) => filter.name === FiltersTypes.shiftX.id);

  return filter?.flag ? filter.value.shift : 0;
}
