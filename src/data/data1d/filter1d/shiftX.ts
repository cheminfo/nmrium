import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Datum1D } from '../../types/data1d/Datum1D';

/**
 *
 * @param {Object} datum1d
 * @param {number} [shiftValue=0]
 */

export const id = 'shiftX';
export const name = 'Shift X';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

export function apply(datum1D: Datum1D, options: { shift?: number } = {}) {
  const { shift = 0 } = options;
  datum1D.data.x = datum1D.data.x.map((val) => val + shift);
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
