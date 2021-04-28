import { xGetFromToIndex } from 'ml-spectra-processing';

export const id = 'fromTo';
export const name = 'From/To';

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D, options = {}) {
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

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}
