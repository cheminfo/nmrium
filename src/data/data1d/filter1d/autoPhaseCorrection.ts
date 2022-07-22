import { reimAutoPhaseCorrection } from 'ml-spectra-processing';

import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'autoPhaseCorrection';
export const name = 'Automatic phase correction';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

const defaultOptions = {
  minRegSize: 5,
  maxDistanceToJoin: 128,
  magnitudeMode: true,
  factorNoise: 5,
};

export function apply(datum1D: Datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }
  return reimAutoPhaseCorrection(datum1D.data, {
    ...defaultOptions,
    ...options,
  });
}

export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  let reduced = { ...previousValue };
  for (const k in reduced) {
    reduced[k] += newValue[k];
  }
  return {
    once: true,
    reduce: reduced,
  };
}
