import { v4 } from '@lukeed/uuid';
import { Filter } from 'nmr-processing';

export function initiateFilters(inputFilters: Filter[] | undefined) {
  if (!inputFilters || !Array.isArray(inputFilters)) return [];

  return inputFilters.map((filter) => ({ ...filter, id: filter?.id || v4() }));
}
