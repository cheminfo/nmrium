/**
 *
 * @param {Datum1d} datum1d
 */
export default function baselineCorrection(datum1D, options = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('baselineCorrection not isApplicable on this data');
  }
  const { algorithm = 'airpls' } = options;

  switch (algorithm.toLowerCase()) {
    case 'airpls':
      break;
    default:
      throw new Error(`baselineCorrection: algorithm unknown: ${algorithm}`);
  }
}

export function isApplicable(datum1D) {
  if (!datum1D.info.isFid) return true;
  return false;
}
