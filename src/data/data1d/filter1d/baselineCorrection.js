import airPLS from 'ml-airpls';
import baselineRegression from 'ml-baseline-correction-regression';
import PolynomialRegression from 'ml-regression-polynomial';

export const id = 'baselineCorrection';
export const name = 'baseline correction';

/**
 *
 * @param {Datum1d} datum1d
 */

export const baselineAlgorithms = {
  airpls: 'airPLS',
  polynomial: 'Polynomial',
  autoPolynomial: 'Auto polynomial',
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
      corrected = airPLS(x, re, options).corrected;
      break;
    case 'autoPolynomial':
      corrected = baselineRegression(x, re, options).corrected;
      baselineRegression(options);
      break;
    case 'polynomial':
      console.log(options);
      const polynomialRegression = new PolynomialRegression(
        x,
        re,
        options.degree,
      );
      corrected = re.slice();
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

/**
 * Will extract x/y points based on zones
 * @param {*} x
 * @param {*} re
 * @param {*} zones
 */
function getZones(x, re, zones = []) {}
