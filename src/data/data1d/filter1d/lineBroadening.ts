import { compose } from 'apodization';

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

  const windowFunction = compose({
    length,
    shapes: [
      {
        start: 0,
        shape: {
          kind: 'exponential',
          options: {
            dw,
            lb: value,
          },
        },
      },
    ],
  });

  const newRE = new Float64Array(length);
  const newIM = new Float64Array(length);
  for (let i = 0; i < length - pointsToShift; i++) {
    newRE[i] = re[i] * windowFunction[i];
    newIM[i] = im[i] * windowFunction[i];
  }

  for (let i = length - 1, j = 0; i > length - pointsToShift - 1; i--, j++) {
    newRE[i] = re[i] * windowFunction[j];
    newIM[i] = im[i] * windowFunction[j];
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
