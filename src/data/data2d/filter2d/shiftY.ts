import { Spectrum2D } from 'nmr-load-save';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'shift2DY';
export const name = 'Shift 2D Y';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: false,
  updateYDomain: true,
};

/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */
export function apply(datum2D: Spectrum2D, options: { shift?: number } = {}) {
  const { shift = 0 } = options;
  for (const key in datum2D.data) {
    datum2D.data[key].minY += shift;
    datum2D.data[key].maxY += shift;
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
