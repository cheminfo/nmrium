import { reduceCombinePreviusAndNew as reduce } from "./utilities";
/**
 *
 * @param {Object} datum1d
 * @param {number} [shiftValue=0]
 */

export const id = 'shiftX';
export const name = 'Shift X';

export { reduce };

export function apply(datum1D, shiftValue = 0) {
  datum1D.data.x = datum1D.data.x.map((val) => val + shiftValue);
}

export function isApplicable() {
  return true;
}
