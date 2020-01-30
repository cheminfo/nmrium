import airPLS from 'ml-airpls';

export const id = 'baselineCorrection';
export const name = 'baseline correction';

/**
 *
 * @param {Datum1d} datum1d
 */
export function apply(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not applicable on this data');
  }
  const { algorithm = 'airpls' } = options;

  switch (algorithm.toLowerCase()) {  
    case 'airpls':
      let result = airPLS(datum1D.data.re, options);
      Object.assign(datum1D.data, {re: result.corrected})
      break;
    default:
      throw new Error(`baselineCorrection: algorithm unknown: ${algorithm}`);
  }
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
