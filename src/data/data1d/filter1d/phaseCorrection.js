import { ReIm } from 'ml-spectra-processing';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

export default function phaseCorrection(datum1D, options = {}) {
  if (!applicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }
  const { ph0, ph1 } = options;
  Object.assign(datum1D.data, ReIm.phaseCorrection(datum1D.data, ph0, ph1));
}

export function applicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}
