import type { Filter1DEntry, Filter2DEntry } from 'nmr-processing';
import type { Spectrum1D, Spectrum2D } from 'nmrium-core';
import { useMemo } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import type { FilterEntry } from '../../data/types/common/FilterEntry.js';

import useSpectrum from './useSpectrum.js';

const emptyData = { filters: {} };
type FilterReturnType<T> = T extends Filter1DEntry['name']
  ? ExtractFilterEntry<T>
  : T extends Filter2DEntry['name']
    ? ExtractFilterEntry<T>
    : null;

export function useFilter<T extends FilterEntry['name']>(
  filterID: T,
): FilterReturnType<T> | null {
  const { filters } = useSpectrum(emptyData) as Spectrum1D | Spectrum2D;

  return useMemo(() => {
    const filter = filters.find((filter) => filter.name === filterID);

    if (filter) {
      return filter as FilterReturnType<T>;
    }

    return null;
  }, [filterID, filters]);
}
