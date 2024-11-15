import type { FilterEntry } from './FilterEntry.js';

export type ExtractFilterEntry<T extends FilterEntry['name']> = Extract<
  FilterEntry,
  { name: T }
>;
