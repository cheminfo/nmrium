import type { Filter2DEntry } from 'nmr-processing';

export function is2DFilter<T extends Filter2DEntry['name']>(
  filter: Filter2DEntry,
  name: T,
): filter is Extract<Filter2DEntry, { name: T }> {
  return filter.name === name;
}
