/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [value]
 */

export default function zeroFilling(datum1D, value) {
  if (!isApplicable(datum1D)) {
    throw new Error('zeroFilling not isApplicable on this data');
  }
  const re = datum1D.data.re;
  const im = datum1D.data.im;
  const length = re.length;
  const newRE = new Float64Array(length);
  const newIM = new Float64Array(length);
  for (let i = 0; i < length; i++) {
    newRE[i] = re[i]; // TODO need to make the line broadening
    newIM[i] = im[i];
  }
  datum1D.data = { ...datum1D.data, ...{ re: newRE, newIM } };
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}
