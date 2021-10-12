import { standardDeviation } from 'ml-stat/array';

import { isApplicable, reduceNull as reduce } from './utilities';

export const id = 'standardDeviation';
export const name = 'Standard Deviation';

  export { isApplicable, reduce };

/**
 * Computes the standard deviation of the given values
 * @param {Datum1d} datum1d
 */

export function apply(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('Standard Deviation is not applicable on this data');
  }

  const re = datum1D.data.re.slice(0);
  const im = datum1D.data.im?.slice(0);

  const reStd = standardDeviation(re);
  const imStd = standardDeviation(im || []);

  for (let i = 0; i < re.length; i++) {
    re[i] /= reStd;
    if (im) {
      im[i] /= imStd;
    }
  }

  datum1D.data.re = re;

  if (im) {
    datum1D.data.im = im;
  }
}
