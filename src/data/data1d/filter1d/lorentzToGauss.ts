import { Datum1D } from '../../types/data1d';

export const id = 'lorentz-to-gauss';
export const name = 'Lorentz-to-Gauss Window';

// This window function is based on https://spin.niddk.nih.gov/NMRPipe/ref/nmrpipe/gm.html
export function apply(datum1D: Datum1D, options: any = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('LG not applicable on this data');
  }
  const { center = 0, gaussHz = 0, expHz = 0 } = options;

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

  const newRE = new Float64Array(length);
  const newIM = new Float64Array(length);

  const dw = (t[length - 1] - t[0]) / (length - 1);

  const C5 = Math.pow(0.6 * Math.PI * gaussHz * dw, 2);
  const C2 = center * (length - 1);
  const C6 = Math.PI * dw * expHz;

  for (let i = 0; i < length - pointsToShift - 1; i++) {
    const curFactor = Math.exp(i * C6 - Math.pow(C2 - i, 2) * C5);
    newRE[i] = re[i] * curFactor;
    newIM[i] = im[i] * curFactor;
  }

  for (let i = length - 1; i > length - pointsToShift - 1; i--) {
    const curFactor = Math.exp(i * C6 - Math.pow(C2 - i, 2) * C5);
    newRE[i] = re[i] * curFactor;
    newIM[i] = im[i] * curFactor;
  }

  datum1D.data = { ...datum1D.data, ...{ re: newRE, im: newIM } };
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
