import type { Spectrum1D } from 'nmr-processing';

import { FilterDomainUpdateRules } from '../../FiltersManager';

/**
 *
 * @param {Spectrum1D} spectrum
 * @param {number} [shiftValue=0]
 */

export const id = 'shiftX';
export const name = 'Shift X';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

export function apply(spectrum: Spectrum1D, options: { shift?: number } = {}) {
  const { shift = 0 } = options;
  spectrum.data.x = spectrum.data.x.map((val) => val + shift);
}

export function isApplicable() {
  return true;
}

export function reduce(previous, next) {
  const { shift: previousValue = 0 } = previous;
  const { shift: nextShift = 0 } = next;
  return {
    once: true,
    reduce: { shift: previousValue + nextShift },
  };
}
