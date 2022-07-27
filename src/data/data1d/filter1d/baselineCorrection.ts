import airPLS from 'ml-airpls';
import equallySpaced from 'ml-array-xy-equally-spaced';
import baselineRegression from 'ml-baseline-correction-regression';

import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'baselineCorrection';
export const name = 'Baseline correction';

/**
 *
 * @param {Datum1d} datum1d
 */

export type BaselineAlgorithms = 'airpls' | 'polynomial';

export interface PolynomialOptions {
  zones: Array<{ from: number; to: number; id: string }>;
  algorithm: 'polynomial';
  degree: number;
}

export interface AirplsOptions {
  zones: Array<{ from: number; to: number; id: string }>;
  algorithm: 'airpls';
  maxIterations: number;
  tolerance: number;
}

export type BaselineCorrectionOptions = PolynomialOptions | AirplsOptions;

export function apply(datum1D: Datum1D, options: BaselineCorrectionOptions) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not applicable on this data');
  }
  const { algorithm } = options;
  let { x, re } = datum1D.data;

  let corrected;
  switch (algorithm) {
    case 'airpls':
      corrected = airPLS(x, re, options).corrected;
      break;
    case 'polynomial':
      {
        const { degree, zones } = options;
        let reduced = equallySpaced(
          { x, y: re },
          { numberOfPoints: 4096, zones },
        );
        let result = baselineRegression(reduced.x, reduced.y, {
          regressionOptions: degree,
        });
        let { regression } = result;
        corrected = new Float64Array(x.length);
        for (let i = 0; i < re.length; i++) {
          corrected[i] = re[i] - regression.predict(x[i]);
        }
      }

      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`baselineCorrection: algorithm unknown: ${algorithm}`);
  }

  Object.assign(datum1D.data, { re: corrected });
}

export function isApplicable(datum1D: Datum1D) {
  if (!datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}
