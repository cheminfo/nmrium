/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [size]
 */

export default function zeroFilling(datum1D, size) {
  if (!isApplicable(datum1D)) {
    throw new Error('zeroFilling not isApplicable on this data');
  }
  const re = datum1D.data.re;
  const im = datum1D.data.im;
  const newRE = new Float64Array(size);
  const newIM = new Float64Array(size);
  const length = Math.min(size, re.length);
  for (let i = 0; i < length; i++) {
    newRE[i] = re[i];
    newIM[i] = im[i];
  }
  datum1D.data = { ...datum1D.data, ...{ re: newRE, newIM } };
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}
