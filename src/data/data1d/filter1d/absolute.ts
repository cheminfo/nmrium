import { reimAbsolute } from 'ml-spectra-processing';

import { isApplicable, reduceNull as reduce } from './utilities';

export const id = 'absolute';
export const name = 'Absolute';

export { isApplicable, reduce };

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('absolute not applicable on this data');
  }

  datum1D.data.re = reimAbsolute(datum1D.data);
  datum1D.data.im = new Float64Array(0);
  datum1D.info = { ...datum1D.info, isComplex: false };
}
