/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */

export const id = 'shift2DY';
export const name = 'Shift 2D Y';

export function apply(datum2D, shiftValue = 0) {
  datum2D.data.minY += shiftValue;
  datum2D.data.maxY += shiftValue;
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
