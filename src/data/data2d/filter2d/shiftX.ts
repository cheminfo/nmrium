import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Datum2D } from '../../types/data2d';

export const id = 'shift2DX';
export const name = 'Shift 2D X';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */

export function apply(datum2D: Datum2D, options: { shift?: number } = {}) {
  const { shift = 0 } = options;
  for (const key in datum2D.data) {
    datum2D.data[key].minX += shift;
    datum2D.data[key].maxX += shift;
  }
}

export function isApplicable() {
  return true;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: previousValue + newValue,
  };
}
