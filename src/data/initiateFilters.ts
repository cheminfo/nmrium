import { v4 } from '@lukeed/uuid';
import type { Filter1D, Filter2D } from 'nmr-processing';

export function initiateFilters(
  inputFilters: Filter1D[] | Filter2D[] | undefined,
) {
  if (!inputFilters || !Array.isArray(inputFilters)) return [];

  return inputFilters.map((filter) => ({ ...filter, id: filter?.id || v4() }));
}
