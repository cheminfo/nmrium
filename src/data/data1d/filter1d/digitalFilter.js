import { ReIm } from 'ml-spectra-processing';

export const id = 'digitalFilter';
export const name = 'Digital Filter';

/**
 * Move points from the beginning to the end of FID and performs a first order phase correction
 * @param {Datum1d} datum1d
 */

export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('Digital Filter is not applicable on this data');
  }

  let { digitalFilterValue = 0 } = options;
  let re = new Float64Array(datum1D.data.re);
  let im = new Float64Array(datum1D.data.im);

  let pointsToShift = Math.floor(digitalFilterValue);
  let ph1 = pointsToShift - digitalFilterValue;

  const skip = 0;
  pointsToShift += 0;

  const newRe = new Float64Array(re.length);
  const newIm = new Float64Array(im.length);
  newRe.set(re.slice(pointsToShift));
  newRe.set(re.slice(skip, pointsToShift), re.length - pointsToShift);
  newIm.set(im.slice(pointsToShift));
  newIm.set(im.slice(skip, pointsToShift), im.length - pointsToShift);

  datum1D.data.re = newRe;
  datum1D.data.im = newIm;

  if (ph1 !== 0) {
    ph1 *= Math.PI * 2;
    Object.assign(datum1D.data, ReIm.phaseCorrection(datum1D.data, 0, ph1));
  }
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: true,
    reduce: undefined,
  };
}
