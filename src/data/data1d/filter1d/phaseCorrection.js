import { ReIm } from 'ml-spectra-processing';

export const id = 'phaseCorrection';
export const name = 'phase correction';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }
  let { ph0, ph1 } = options;
  ph0 *= Math.PI / 180.0;
  ph1 *= Math.PI / 180.0;
  Object.assign(datum1D.data, ReIm.phaseCorrection(datum1D.data, ph0, ph1));
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  let reduced = Object.assign({}, previousValue);
  for (const k in reduced) {
    reduced[k] += newValue[k];
  }
  return {
    once: true,
    reduce: reduced,
  };
}
