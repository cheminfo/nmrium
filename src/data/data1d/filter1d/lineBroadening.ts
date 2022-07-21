import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'lineBroadening';
export const name = 'Line broadening';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [value]
 */

export function apply(datum1D: Datum1D, value) {
  if (!isApplicable(datum1D)) {
    throw new Error('lineBroadening not applicable on this data');
  }

  let grpdly = datum1D.info?.digitalFilter || 0;
  let pointsToShift;
  if (grpdly > 0) {
    pointsToShift = Math.floor(grpdly);
  } else {
    pointsToShift = 0;
  }

  const re = datum1D.data.re;
  const im = datum1D.data.im;
  const t = datum1D.data.x;

  const length = re.length;

  const newRE = new Float64Array(length); // I don't think we need a new array... here
  const newIM = new Float64Array(length);
  //if (value !== 0) {// is it OK to skip this line if "value" is zero?
  //please check this test of zero is correct !== or != ...
  const dw = (t[length - 1] - t[0]) / (length - 1); //REPLACE CONSTANT with calculated value... : for this we need AQ or DW to set it right...
  // convert line broadening in Hz into exponential coefficient:
  const em = -value * Math.exp(1);

  const coefExp = Math.exp(em * dw);
  let curFactor = Math.exp(em * t[0]); // in case does not start at zero
  for (let i = 0; i < length - pointsToShift; i++) {
    newRE[i] = re[i] * curFactor;
    newIM[i] = im[i] * curFactor;
    curFactor = curFactor * coefExp;
  }
  curFactor = Math.exp(em * t[0]);
  for (let i = length; i > length - pointsToShift; i--) {
    newRE[i] = re[i] * curFactor;
    newIM[i] = im[i] * curFactor;
    curFactor = curFactor * coefExp;
  }
  datum1D.data = { ...datum1D.data, ...{ re: newRE, im: newIM } };
  //}
}
export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}
