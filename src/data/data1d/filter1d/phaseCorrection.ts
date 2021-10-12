import { reimPhaseCorrection } from 'ml-spectra-processing';

import { isApplicable, reduceWithNewValue as reduce } from './utilities';

export const id = 'phaseCorrection';
export const name = 'Phase correction';

export { isApplicable, reduce };
/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

export function apply(datum1D, options: any = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }
  let { ph0, ph1 } = options;
  ph0 *= Math.PI / 180.0;
  ph1 *= Math.PI / 180.0;
  Object.assign(datum1D.data, reimPhaseCorrection(datum1D.data, ph0, ph1));
}


