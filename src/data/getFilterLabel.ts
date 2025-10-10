import { Filters1D, Filters2D } from 'nmr-processing';

import type { FilterEntry } from './types/common/FilterEntry.js';

export function getFilterLabel(name: FilterEntry['name']): string {
  if (isFilter1DName(name)) {
    return Filters1D[name].label;
  }
  if (isFilter2DName(name)) {
    return Filters2D[name].label;
  }
  return '';
}

function isFilter1DName(name: string): name is keyof typeof Filters1D {
  return name in Filters1D;
}

function isFilter2DName(name: string): name is keyof typeof Filters2D {
  return name in Filters2D;
}
