/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [value]
 */

export default function lineBroadening(datum1D, value) {
  if (!isApplicable(datum1D)) {
    throw new Error('zeroFilling not isApplicable on this data');
  }
  const re = datum1D.data.re;
  const im = datum1D.data.im;
  const length = re.length;
  const newRE = new Float64Array(length);
  const newIM = new Float64Array(length);
  let coefExp;
  let curFactor;
  let dw;
  if (value !== 0) {
    //please check this test of zero is correct !== or != ...
    dw = 1e-6; //REPLACE CONSTANT with calculated value... : for this we need AQ or DW to set it right...
    coefExp = 0.999 * dw; //REPLACE CONSTANT with calculated value... : for this we need AQ or DW to set it right...
    curFactor = 1.0;
    // test here if first point if FID is at time zero... if not change cur_factor accordingly.
    // cur_factor=cur_factor*...
    //let alpha = 20 * Math.log10(y[targetIndex - 1]);
    //const beta = Math.sin(delta); //will not be changed....
    // let cosTheta = Math.cos(phi0);// will be changed....

    for (let i = 0; i < length; i++) {
      newRE[i] = re[i] * curFactor;
      newIM[i] = im[i] * curFactor;
      curFactor = curFactor * coefExp;
    }
    datum1D.data = { ...datum1D.data, ...{ re: newRE, newIM } }; // is it OK to skip this line if value is zero?
  }
}
export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}
