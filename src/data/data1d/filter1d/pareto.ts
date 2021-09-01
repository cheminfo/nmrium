import { xParetoNormalization } from 'ml-spectra-processing';

export const id = 'pareto';
export const name = 'Pareto';

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
