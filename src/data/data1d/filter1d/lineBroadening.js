/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [value]
 */

export default function lineBroadening(datum1D, value) {
  if (!isApplicable(datum1D)) {
    throw new Error('lineBroadening not isApplicable on this data');
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
  for (let i = 0; i < length; i++) {
    newRE[i] = re[i] * curFactor;
    newIM[i] = im[i] * curFactor;
    curFactor = curFactor * coefExp;
  }
  datum1D.data = { ...datum1D.data, ...{ re: newRE, im: newIM } };
  //}
}
export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: previousValue + newValue,
  };
}
