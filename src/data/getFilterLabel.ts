import { Filters1D, Filters2D } from 'nmr-processing';
import type { FilterEntry } from './types/common/FilterEntry.js';

export function getFilterLabel(name: FilterEntry['name']): string {
  if (name in Filters1D) {
    return Filters1D[name].label;
  }
  if (name in Filters2D) {
    return Filters2D[name].label;
  }
  return '';
}
