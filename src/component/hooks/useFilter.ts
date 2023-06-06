import { Spectrum1D } from 'nmr-load-save';
import { useMemo } from 'react';

import useSpectrum from './useSpectrum';

const emptyData = { filters: {} };

export function useFilter(filterID: string) {
  const { filters } = useSpectrum(emptyData) as Spectrum1D;

  return useMemo(
    () => filters.find((filter) => filter.name === filterID) || null,
    [filterID, filters],
  );
}
