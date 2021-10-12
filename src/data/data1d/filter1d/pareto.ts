import { xParetoNormalization } from 'ml-spectra-processing';

import { isApplicable, reduceNull as reduce } from './utilities';

export const id = 'pareto';
export const name = 'Pareto';

export { isApplicable, reduce };
/**
 * Computes the arithmetic mean of the given values
 * @param {Datum1d} datum1d
 */

export function apply(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('Pareto is not applicable on this data');
  }

  const re = datum1D.data.re.slice(0);
  const im = datum1D.data.im?.slice(0);

  datum1D.data.re = xParetoNormalization(re);
  if (im) {
    datum1D.data.im = xParetoNormalization(im);
  }
}
