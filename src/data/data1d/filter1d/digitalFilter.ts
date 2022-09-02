import { xAdd } from 'ml-spectra-processing';
import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'digitalFilter';
export const name = 'Digital Filter';

/**
 * Move points from the beginning to the end of FID and performs a first order phase correction
 * @param {Datum1d} datum1d
 */

export function apply(datum1D: Datum1D, options: any = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('Digital Filter is not applicable on this data');
  }

  let { digitalFilterValue = 0 } = options;
  let re = new Float64Array(datum1D.data.re);
  let im = new Float64Array(datum1D.data.im);

  let pointsToShift = Math.floor(digitalFilterValue);

  const skip = 0; //Math.floor(digitalFilterValue + 2);
  // pointsToShift = ; //Math.max(skip - 6, 0);

  const newRe = new Float64Array(re.length);
  const newIm = new Float64Array(im.length);
  newRe.set(re.slice(pointsToShift));
  newRe.set(
    xAdd(re.slice(skip, pointsToShift), re.slice(re.length - pointsToShift)),
    re.length - pointsToShift,
  );
  newIm.set(im.slice(pointsToShift));
  newIm.set(
    xAdd(im.slice(skip, pointsToShift), im.slice(re.length - pointsToShift)),
    im.length - pointsToShift,
  );

  datum1D.data.re = newRe;
  datum1D.data.im = newIm;
}

export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: true,
    reduce: undefined,
  };
}
