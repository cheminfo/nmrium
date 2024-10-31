import { Spectrum1D } from 'nmr-load-save';
import { Filter1D } from 'nmr-processing';
import { useMemo } from 'react';

import useSpectrum from './useSpectrum.js';

const emptyData = { filters: {} };

export function useFilter(filterID: string): Filter1D | null {
  const { filters } = useSpectrum(emptyData) as Spectrum1D;

  return useMemo(
    () => filters.find((filter) => filter.name === filterID) || null,
    [filterID, filters],
  );
}
