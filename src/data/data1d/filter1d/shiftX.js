/**
 *
 * @param {Object} datum1d
 * @param {number value  shift value
 */

export default function shiftX(datum1D, shiftValue) {
  datum1D.data.x = datum1D.data.x.map((val) => val + shiftValue);
}
