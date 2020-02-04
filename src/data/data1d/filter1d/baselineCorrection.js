import airPLS from 'ml-airpls';
import baselineRegression from 'ml-baseline-correction-regression';

export const id = 'baselineCorrection';
export const name = 'baseline correction';

/**
 *
 * @param {Datum1d} datum1d
 */

export const baselineAlgorithms = {
  airpls: 'airPLS',
  polynomial: 'Polynomial',
};

export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not applicable on this data');
  }
  const { algorithm } = options;

  let { x, re } = datum1D.data;
  let corrected;
  switch (algorithm) {
    case 'airpls':
      corrected = airPLS(re, options).corrected;
      break;
    case 'polynomial':
      corrected = baselineRegression(x, re, options).corrected;
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

export function reduce() {
  return {
    once: false,
    reduce: null,
  };
}
