import type { Spectrum1D, Spectrum2D } from 'nmr-load-save';
import type { Filter1D, Filter2D } from 'nmr-processing';
import { useMemo } from 'react';

import useSpectrum from './useSpectrum.js';

const emptyData = { filters: {} };

export function useFilter(filterID: Filter1D['name'] | Filter2D['name']) {
  const { filters } = useSpectrum(emptyData) as Spectrum1D | Spectrum2D;

  return useMemo(
    () => filters.find((filter) => filter.name === filterID) || null,
    [filterID, filters],
  );
}
