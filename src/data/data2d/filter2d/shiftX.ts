import { Datum2D } from '../../types/data2d';

export const id = 'shift2DX';
export const name = 'Shift 2D X';

/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */

export function apply(datum2D: Datum2D, shiftValue = 0) {
  datum2D.data.minX += shiftValue;
  datum2D.data.maxX += shiftValue;
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
