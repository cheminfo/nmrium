/**
 *
 * @param {Object} datum1d
 * @param {number} [shiftValue=0]
 */

export default function shiftX(datum1D, shiftValue = 0) {
  if (!isApplicable(datum1D)) {
    throw new Error('shiftX not isApplicable on this data');
  }

  datum1D.data.x = datum1D.data.x.map((val) => val + shiftValue);
}

export function isApplicable() {
  return true;
}
