import { xGetFromToIndex } from 'ml-spectra-processing';

import { isApplicable, reduceWithNewValue as reduce } from './utilities';

export const id = 'fromTo';
export const name = 'From/To';

export { isApplicable, reduce };

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D, options: any = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('From/To filter not applicable on this data');
  }
  const { x, re, im } = datum1D.data;
  const { from, to } = options;
  const { fromIndex, toIndex } = xGetFromToIndex(x, { from, to });

  datum1D.data.x = x.slice(fromIndex, toIndex);
  datum1D.data.re = re.slice(fromIndex, toIndex);
  if (im) {
    datum1D.data.im = im.slice(fromIndex, toIndex);
  }
}
