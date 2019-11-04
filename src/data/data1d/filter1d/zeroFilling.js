/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [size]
 */

export default function zeroFilling(datum1D, size) {
  if (!isApplicable(datum1D)) {
    throw new Error('zeroFilling not isApplicable on this data');
  }
  const { re, im, x } = datum1D.data;
  let newRE = new Float64Array(size);
  let newIM = new Float64Array(size);
  let newX = new Float64Array(size);
  const length = Math.min(size, re.length);
  for (let i = 0; i < length; i++) {
    newRE[i] = re[i];
    newIM[i] = im[i];
    newX[i] = x[i];
  }
  let diff = x[1] - x[0];
  let currentX = x[length - 1];
  for (let i = length; i < newX.length; i++) {
    currentX += diff;
    newX[i] = currentX;
  }
  console.log(newX, newRE);
  datum1D.data = { ...datum1D.data, ...{ re: newRE, im: newIM, x: newX } };
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: undefined,
  };
}
