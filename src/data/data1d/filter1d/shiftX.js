/**
 *
 * @param {Object} datum1d
 * @param {number} [shiftValue=0]
 */

export const id = 'shiftX';
export const name = 'shift X';

export function apply(datum1D, shiftValue = 0) {
  if (!isApplicable(datum1D)) {
    throw new Error('shiftX not isApplicable on this data');
  }

  datum1D.data.x = datum1D.data.x.map((val) => val + shiftValue);
}

export function isApplicable() {
  return true;
}

export function reduce() {
  return {
    once: false,
    reduce: null,
  };
}
