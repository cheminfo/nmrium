import { ReIm } from 'ml-spectra-processing';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

export default function phaseCorrection(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not isApplicable on this data');
  }
  let { ph0, ph1, pivotIndex } = options;
  ph0 *= Math.PI / 180;
  ph1 *= Math.PI / 180;
  ph0 = ph0 - (ph1 * pivotIndex) / datum1D.data.x.length;
  Object.assign(
    datum1D.data,
    ReIm.phaseCorrection(datum1D.source.original, ph0, ph1),
  );
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}
