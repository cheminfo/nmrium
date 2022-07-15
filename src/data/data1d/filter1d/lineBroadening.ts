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
  const dw = (t[length - 1] - t[0]) / (length - 1); //REPLACE CONSTANT with calculated value... : for this we need AQ or DW to set it right...

  const newRE = appyWindow(re, lorentToGauss, { center: 0, gaussHz: 0, expHz: -value, dw })
  const newIM = appyWindow(im, lorentToGauss, { center: 0, gaussHz: 0, expHz: -value, dw })

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

function appyWindow(data, func, options) {
  const { length = data.length, start = 0 } = options;

  if (start + length > data.length) {
    throw new RangeError(
      'the size of the window function should not greater than data length',
    );
  }

  const result = new Float64Array(data);
  const generator = func({ ...options, length });
  for (let i = start; i < length; i++) {
    result[i] *= generator(i);
  }

  return result;
}

function lorentToGauss(options) {
  const { dw, length, gaussHz = 0, expHz = 0, center = 0 } = options;
  const C5 = Math.pow(0.6 * Math.PI * gaussHz * dw, 2);
  const C2 = center * (length - 1);
  const C6 = Math.PI * dw * expHz;

  return (i) => Math.exp(i * C6 - Math.pow(C2 - i, 2) * C5);
}