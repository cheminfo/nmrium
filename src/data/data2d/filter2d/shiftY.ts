import { Datum2D } from '../../types/data2d';

export const id = 'shift2DY';
export const name = 'Shift 2D Y';
/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */
export function apply(datum2D: Datum2D, shiftValue = 0) {
  for (const key in datum2D.data) {
    datum2D.data[key].minY += shiftValue;
    datum2D.data[key].maxY += shiftValue;
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
