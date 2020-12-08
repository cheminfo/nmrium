import { xyXShift } from 'ml-spectra-processing';

import { getRange } from '../constants/References';
/**
 *
 * @param {*} datum1D
 * @param {object} [options={}]
 * @param {number} [options.from]
 * @param {number} [options.to] Define the from zone where the reference is expected to be found
 * @param {number} [options.from]
 * @param {number} [options.nbPeaks]
 * @param {number} [options.targetX]
 * @param {string} [options.reference]
 */

export default function getReferenceShift(datum1D, options) {
  let { from, to, nbPeaks, targetX, reference } = options;
  if (reference) {
    let data = getRange({ reference: reference, nucleus: datum1D.nucleus });
    from = data.from;
    to = data.to;
    nbPeaks = data.nbPeaks;
    targetX = data.delta;
  }
  const { re, x } = datum1D.data;
  return xyXShift({ x, y: re }, { from, to, nbPeaks, targetX });
}
