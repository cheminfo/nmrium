import { apodization } from 'nmr-processing';

import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'lineBroadening';
export const name = 'Line broadening';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [value]
 */

export function apply(datum1D: Datum1D, options) {
  const { lineBroadeningValue, gaussBroadeningValue, centerValue } = options;
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

  const newData = apodization(
    { re, im },
    {
      pointsToShift,
      compose: {
        length,
        shapes: [
          {
            start: 0,
            shape: {
              kind: 'lorentzToGauss',
              options: {
                length,
                dw,
                exponentialHz:
                  gaussBroadeningValue > 0
                    ? lineBroadeningValue
                    : -lineBroadeningValue,
                gaussianHz: gaussBroadeningValue,
                center: centerValue,
              },
            },
          },
        ],
      },
    },
  );

  datum1D.data = {
    ...datum1D.data,
    ...{ re: newData.re as Float64Array, im: newData.im as Float64Array },
  };
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
