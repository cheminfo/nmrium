import { mean } from 'ml-stat/array';

export const id = 'centerMean';
export const name = 'Center Mean';

/**
 * Computes the arithmetic mean of the given values
 * @param {Datum1d} datum1d
 */

export function apply(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('Center Mean is not applicable on this data');
  }

  const re = datum1D.data.re.slice(0);
  const im = datum1D.data.im?.slice(0);

  const reMean = mean(re);
  const imMean = mean(im || []);

  for (let i = 0; i < re.length; i++) {
    re[i] -= reMean;
    if (im) {
      im[i] -= imMean;
    }
  }

  datum1D.data.re = re;

  if (im) {
    datum1D.data.im = im;
  }
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: false,
    reduce: null,
  };
}
