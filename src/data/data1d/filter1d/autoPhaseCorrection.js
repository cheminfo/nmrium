import { reimAutoPhaseCorrection } from 'ml-spectra-processing';

export const id = 'autoPhaseCorrection';
export const name = 'automatic phase correction';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

const defaultOptions = {
  magnitudeMode: false,
  minRegSize: 30,
  maxDistanceToJoin: 256,
};

export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }
  options = Object.assign({}, defaultOptions, options);

  return reimAutoPhaseCorrection(datum1D.data, options);
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
