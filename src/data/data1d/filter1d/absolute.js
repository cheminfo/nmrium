import { ReIm } from 'ml-spectra-processing';

/**
 *
 * @param {Datum1d} datum1d
 */

export default function absolute(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('absolute not isApplicable on this data');
  }

  datum1D.data.re = ReIm.absolute(datum1D.data);
  datum1D.data.im = new Float64Array(0);
  datum1D.info.isComplex = false;
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}
