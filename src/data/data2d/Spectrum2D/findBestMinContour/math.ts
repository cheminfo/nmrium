export function gaussianTwoSidedTail(k: number): number {
  return erfc(k / Math.SQRT2);
}

/**
 * Approximation of the complementary error function.
 * @TODO it would be replaced by the same implementation from ml-spectra-processing.
 */
function erfc(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);

  const p = 0.3275911;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * ax);

  const polynomial = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;

  const result = polynomial * Math.exp(-ax * ax);

  return sign >= 0 ? result : 2 - result;
}

export function violation(value: number, limit: number): number {
  if (limit === 0) {
    return value === 0 ? 0 : 1;
  }

  return Math.max(0, value / limit - 1);
}

export function validateInput(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
): void {
  if (!Number.isInteger(rows) || rows <= 0) {
    throw new Error('rows must be a positive integer');
  }

  if (!Number.isInteger(cols) || cols <= 0) {
    throw new Error('cols must be a positive integer');
  }

  if (matrix.length !== rows * cols) {
    throw new Error('matrix.length must equal rows * cols');
  }

  if (!Number.isFinite(noiseLevel) || noiseLevel <= 0) {
    throw new Error('noiseLevel must be a positive finite number');
  }
}
