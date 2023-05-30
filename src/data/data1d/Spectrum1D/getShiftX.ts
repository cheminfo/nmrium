import { Spectrum1D , Filters as FiltersTypes } from 'nmr-processing';


export function getShiftX(spectrum: Spectrum1D): number {
  const filter =
    spectrum?.filters &&
    spectrum?.filters.find((filter) => filter.name === FiltersTypes.shiftX.id);

  return filter?.flag ? filter.value.shift : 0;
}
