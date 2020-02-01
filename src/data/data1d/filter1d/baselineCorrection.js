import airPLS from 'ml-airpls';
import baselineCorrection from 'ml-baseline-correction-regression';

export const id = 'baselineCorrection';
export const name = 'baseline correction';

/**
 *
 * @param {Datum1d} datum1d
 */

const baseline = {
  airpls: airPLS,
  polynomial: baselineCorrection,
};
export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not applicable on this data');
  }
  const { algorithm = 'polynomial' } = options;

  if (!baseline[algorithm]) {
    throw new Error(`baselineCorrection: algorithm unknown: ${algorithm}`);
  }

  let { x, re } = datum1D.data;
  let { corrected } = baseline[algorithm](x, re, options);
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
