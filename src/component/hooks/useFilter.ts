import { Datum1D } from '../../data/types/data1d';

import useSpectrum from './useSpectrum';

const emptyData = { filters: {} };

export function useFilter(filterID: string) {
  const { filters } = useSpectrum(emptyData) as Datum1D;

  return filters.find((filter) => filter.name === filterID) || null;
}
