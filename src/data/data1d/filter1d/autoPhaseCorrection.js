import { ReIm } from 'ml-spectra-processing';

export const id = 'autoPhaseCorrection';
export const name = 'automatic phase correction';

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
  let { minRegSize = 256 } = options;

  return ReIm.autoPhaseCorrection(datum1D.data, { minRegSize });
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