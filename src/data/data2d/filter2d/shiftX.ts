import { Spectrum2D } from 'nmr-load-save';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'shift2DX';
export const name = 'Shift 2D X';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

/**
 *
 * @param {Spectrum2D} spectrum
 * @param {number} [shiftValue=0]
 */

export function apply(spectrum: Spectrum2D, options: { shift?: number } = {}) {
  const { shift = 0 } = options;
  for (const key in spectrum.data) {
    spectrum.data[key].minX += shift;
    spectrum.data[key].maxX += shift;
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
