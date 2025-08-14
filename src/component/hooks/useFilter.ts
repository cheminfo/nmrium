import type { Filter1DEntry, Filter2DEntry } from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import type { FilterEntry } from '../../data/types/common/FilterEntry.js';

import useSpectrum from './useSpectrum.js';

const emptyData = { filters: [] };
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
    if (!filters?.length) return null;

    const filter = filters.find((filter) => filter.name === filterID);

    return (filter as FilterReturnType<T>) ?? null;
  }, [filterID, filters]);
}
