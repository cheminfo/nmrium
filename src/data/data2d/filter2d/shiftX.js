/**
 *
 * @param {Object} datum2d
 * @param {number} [shiftValue=0]
 */

export const id = 'shift2DX';
export const name = 'Shift 2D X';

export function apply(datum2D, shiftValue = 0) {
  if (!isApplicable(datum2D)) {
    throw new Error('shiftX not applicable on this data');
  }
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
