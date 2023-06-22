import { Spectrum1D } from 'nmr-load-save';
import { Filter } from 'nmr-processing';
import { useMemo } from 'react';

import useSpectrum from './useSpectrum';

const emptyData = { filters: {} };

export function useFilter(filterID: string): Filter | null {
  const { filters } = useSpectrum(emptyData) as Spectrum1D;

  return useMemo(
    () => filters.find((filter) => filter.name === filterID) || null,
    [filterID, filters],
  );
}
