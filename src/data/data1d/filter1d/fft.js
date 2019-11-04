import { FFT } from 'ml-fft';

/**
 *
 * @param {Datum1d} datum1d
 */

export default function fft(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('fft not isApplicable on this data');
  }

  const re = new Float64Array(datum1D.data.re);
  const im = new Float64Array(datum1D.data.im);

  FFT.init(re.length);

  FFT.fft(re, im);
  datum1D.data.re = re;
  datum1D.data.im = im;
  datum1D.info.isFid = false;
}

export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return false;
}
