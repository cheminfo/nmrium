import { v4 } from '@lukeed/uuid';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import type { FilterEntry } from '../../data/types/common/FilterEntry.js';

export function getDefaultFilterOptions<T extends FilterEntry['name']>(
  name: T,
): ExtractFilterEntry<T> {
  return {
    enabled: true,
    id: v4(),
    name,
    value: null,
  } as unknown as ExtractFilterEntry<T>;
}