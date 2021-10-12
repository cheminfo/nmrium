import airPLS from 'ml-airpls';
import equallySpaced from 'ml-array-xy-equally-spaced';
import baselineRegression from 'ml-baseline-correction-regression';

import { reduceNull as reduce } from './utilities';

export const id = 'baselineCorrection';
export const name = 'Baseline correction';

export { reduce };

/**
 *
 * @param {Datum1d} datum1d
 */

export const baselineAlgorithms = {
  airpls: 'airPLS',
  polynomial: 'Polynomial',
};

export function apply(datum1D, options: any = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not applicable on this data');
  }
  const { algorithm, zones = [] } = options;
  let { x, re } = datum1D.data;

  let corrected;
  switch (algorithm) {
    case 'airpls':
      corrected = airPLS(x, re, options).corrected;
      break;
    case 'polynomial':
      {
        const baselineOptions = {
          regressionOptions: options.degree,
        };
        let reduced = equallySpaced(
          { x, y: re },
          { numberOfPoints: 4096, zones },
        );
        let result = baselineRegression(reduced.x, reduced.y, baselineOptions);
        let { regression } = result;
        corrected = new Float64Array(x.length);
        for (let i = 0; i < re.length; i++) {
          corrected[i] = re[i] - regression.predict(x[i]);
        }
      }

      break;
    default:
      throw new Error(`baselineCorrection: algorithm unknown: ${algorithm}`);
  }

  Object.assign(datum1D.data, { re: corrected });
}

export function isApplicable(datum1D) {
  if (!datum1D.info.isFid) return true;
  return false;
}
