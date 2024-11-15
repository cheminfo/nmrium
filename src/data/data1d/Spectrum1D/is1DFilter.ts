import type { Filter1DEntry } from 'nmr-processing';

export function is1DFilter<T extends Filter1DEntry['name']>(
  filter: Filter1DEntry | null,
  name: T,
): filter is Extract<Filter1DEntry, { name: T }> {
  return filter?.name === name;
}
