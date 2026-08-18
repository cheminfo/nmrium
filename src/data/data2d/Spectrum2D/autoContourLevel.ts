/**
 * autoContourLevel.ts
 *
 * Automatic minimum-contour-level selection for 2D NMR spectra.
 *
 * Algorithm: Signal Purity Threshold (SPT)
 * ─────────────────────────────────────────
 * Finds the smallest absolute-intensity threshold L such that the
 * fraction of pixels above L that are *genuine signal* (not Gaussian
 * noise) meets a configurable target (default 50 %).
 *
 * The threshold is symmetric: use +L_min for positive contours and
 * −L_min for negative contours.
 */

// ─── Math utilities ────────────────────────────────────────────────────────

/**
 * Complementary error function  erfc(x) = 1 − erf(x).
 *
 * Rational approximation from Abramowitz & Stegun §7.1.26.
 * Max absolute error: |ε| < 1.5 × 10⁻⁷ for all real x.
 *
 * For Gaussian X ~ N(0, σ²):  P(|X| > L) = erfc(L / (σ√2))
 */
export function erfc(x: number): number {
  if (x < 0) return 2 - erfc(-x);
  const t = 1 / (1 + 0.3275911 * x);
  return (
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) *
    Math.exp(-x * x)
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AutoContourOptions {
  /**
   * Desired fraction of pixels above L_min that are genuine signal.
   *
   * Range: (0, 1).  Default: 0.5.
   *
   * Interpretation:
   *   0.5 → transition point (half noise, half signal above L_min).
   *         Good balance: weak peaks are included, modest noise.
   *   0.7 → cleaner display; may hide the weakest peaks.
   *   0.9 → very clean; only use when weak-peak visibility is not critical.
   *
   * This is the most impactful parameter to expose to the user.
   */
  signalPurityTarget?: number;

  /**
   * Hard lower bound: L_min is always ≥ this × noiseSigma,
   * even if purity is already satisfied at a lower threshold.
   *
   * Prevents accidental noise display from σ mis-estimation.
   * Default: 3.0
   */
  minimumNoiseMultiple?: number;

  /**
   * Fallback multiple of σ used when the algorithm cannot find a
   * data-driven threshold (very noisy, near-empty, or poor-SNR spectra).
   *
   * Default: 8.0  (conservative; produces few or no contours when
   * no real signal is detectable, which is the correct visual output).
   */
  fallbackNoiseMultiple?: number;

  /**
   * Upper limit of the search range in multiples of noiseSigma.
   * Increase for spectra with extreme dynamic range (> 10 000 : 1).
   * Default: 30.0
   */
  searchMaxMultiple?: number;

  /**
   * Minimum number of pixels that must lie above a candidate L_min
   * for it to be considered valid.
   *
   * Prevents choosing a threshold where only 1–2 outlier pixels qualify,
   * which would give an unreliable purity estimate.
   * Default: 10
   */
  minimumPixelCount?: number;

  /**
   * Number of log-spaced candidates evaluated during the sweep.
   * Higher → finer resolution in the L axis; negligible speed cost.
   * Default: 300
   */
  searchSteps?: number;
}

export interface AutoContourResult {
  /**
   * Recommended minimum contour level (absolute intensity).
   * Use +minLevel for positive contours, −minLevel for negative ones.
   */
  minLevel: number;

  /** minLevel / noiseSigma for easy interpretation and logging. */
  noiseMultiple: number;

  /**
   * True  → a data-driven threshold was found in the spectrum.
   * False → the algorithm fell back to fallbackNoiseMultiple × σ
   *         (noisy, sparse, or near-empty spectrum).
   */
  dataAdaptive: boolean;

  /**
   * Estimated fraction of pixels above minLevel that are genuine signal
   * rather than Gaussian noise.  Range [0, 1].
   *
   * Useful for diagnostics and for surfacing confidence to the user
   * ("threshold at 5.2 σ — 78 % signal purity").
   */
  signalPurityAtThreshold: number;
}

// ─── Main algorithm ────────────────────────────────────────────────────────

/**
 * Automatically select the minimum contour level for a 2D NMR spectrum.
 *
 * ## How it works
 *
 * 1. Sort absolute intensities once.
 * 2. For each candidate threshold L (log-spaced from 3 σ to 30 σ):
 *      actual  = number of pixels with |I| > L           (binary search)
 *      noise   = N · erfc(L / (σ√2))                     (theoretical)
 *      purity  = (actual − noise) / actual
 * 3. Return the smallest L where purity ≥ target AND actual ≥ N_min.
 * 4. If no such L exists, return fallbackNoiseMultiple × σ.
 *
 * ## Complexity
 *   Sorting: O(N log N)  — once.
 *   Sweep:   O(steps · log N) ≈ O(300 · 20) = O(6000) — negligible.
 *
 * @param intensities  Flattened spectrum matrix (real-valued, row-major).
 *                     Positive and negative values are both handled.
 * @param noiseSigma   Estimated noise standard deviation (must be > 0).
 *                     Typically measured in a spectral region known to
 *                     contain no peaks.
 * @param options      Algorithm tuning parameters (all optional).
 */
export function computeMinContourLevel(
  intensities: ArrayLike<number>,
  noiseSigma: number,
  options: AutoContourOptions = {},
): AutoContourResult {
  const {
    signalPurityTarget = 0.99,
    minimumNoiseMultiple = 5,
    fallbackNoiseMultiple = 8,
    searchMaxMultiple = 50,
    minimumPixelCount = Math.floor(intensities.length * 0.005),
    searchSteps = 300,
  } = options;

  // ── Guard: return fallback for degenerate inputs ─────────────────────────
  const fallback: AutoContourResult = {
    minLevel: fallbackNoiseMultiple * noiseSigma,
    noiseMultiple: fallbackNoiseMultiple,
    dataAdaptive: false,
    signalPurityAtThreshold: 0,
  };

  const N = intensities.length;

  if (N === 0 || !(noiseSigma > 0) || !Number.isFinite(noiseSigma)) return fallback;

  // ── 1. Compute and sort absolute intensities ─────────────────────────────
  const absArr = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    absArr[i] = Math.abs(intensities[i]);
  }
  absArr.sort(); // ascending; in-place, O(N log N)

  // ── 2. O(log N) count of pixels strictly above a threshold ───────────────
 function countAbove(threshold: number): number {
    let lo = 0;
    let hi = N;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (absArr[mid] <= threshold) {
        lo = mid + 1
      } else {
        hi = mid
      };
    }
    return N - lo;
  }

  // ── 3. Theoretical noise count above threshold ───────────────────────────
  // For X ~ N(0, σ²):  P(|X| > L) = erfc(L / (σ√2))
  const SQRT2 = Math.SQRT2;
  function noiseCountAbove(L: number): number {
    return N * erfc(L / (noiseSigma * SQRT2));
  }

  // ── 4. Log sweep from floor to ceiling ───────────────────────────────────
  //
  // Purity condition:
  //   R(L) = (actual − noise) / actual  ≥ target
  //   ⟺  actual ≥ noise / (1 − target)     [since actual > 0]
  //
  // Sweep low → high; break at the first L satisfying the condition.
  // This gives the *minimum* threshold where signal dominates.

  const Lfloor = minimumNoiseMultiple * noiseSigma;
  const Lceil = searchMaxMultiple * noiseSigma;
  const logLo = Math.log(Lfloor);
  const logHi = Math.log(Lceil);
  const purityScale = 1 / (1 - signalPurityTarget); // e.g. 2.0 for target 0.5

  for (let step = 0; step <= searchSteps; step++) {
    const L = Math.exp(logLo + (step / searchSteps) * (logHi - logLo));
    const actual = countAbove(L);
  
    // Skip if too few pixels above this threshold (unreliable purity estimate).
    if (actual < minimumPixelCount) continue;

    const noise = noiseCountAbove(L);
    if (actual >= purityScale * noise) {
      // Purity condition met.  Clamp to [0,1] to handle small σ errors.
      const signalPurityAtThreshold = Math.min(
        1,
        Math.max(0, (actual - noise) / actual),
      );
      return {
        minLevel: L,
        noiseMultiple: L / noiseSigma,
        dataAdaptive: true,
        signalPurityAtThreshold,
      };
    }
  }

  // No threshold found: spectrum is too noisy or too sparse.
  return fallback;
}

// ─── Companion utilities ───────────────────────────────────────────────────

/**
 * Compute a robust maximum contour level from the spectrum.
 *
 * Uses a high percentile of |intensities| (default: 99.9th) to avoid
 * a single outlier pixel inflating L_max and compressing all contours
 * into the bottom of the range.
 *
 * @param intensities  Flattened spectrum matrix.
 * @param percentile   Quantile in (0, 1).  Default: 0.999.
 */
export function computeMaxContourLevel(
  intensities: ArrayLike<number>,
  percentile = 0.999,
): number {
  const N = intensities.length;
  if (N === 0) return 1;

  const absArr = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    absArr[i] = Math.abs(intensities[i]);
  }
  absArr.sort();

  const idx = Math.min(Math.floor(percentile * N), N - 1);
  return absArr[idx];
}

// ─── Exponential contour level builder ────────────────────────────────────

export interface ContourLevels {
  /** Positive contour levels, ascending. */
  positive: number[];
  /** Negative contour levels (mirrors of positive, descending). */
  negative: number[];
  /** The exponential ratio r used: L_{n+1} = L_n · r */
  ratio: number;
}

export interface BuildContourOptions {
  /** Minimum contour level (from computeMinContourLevel). */
  minLevel: number;
  /** Maximum contour level (from computeMaxContourLevel or user override). */
  maxLevel: number;
  /**
   * Number of positive levels.  Ignored if `ratio` is provided.
   * Default: 12.
   */
  nLevels?: number;
  /**
   * Fixed exponential ratio r.  If provided, nLevels is derived as
   *   floor(log(maxLevel / minLevel) / log(r)) + 1
   * so the levels span the full [minLevel, maxLevel] range.
   */
  ratio?: number;
}

/**
 * Build symmetric, exponentially spaced contour levels.
 *
 * Positive levels:  [L_min, L_min·r, L_min·r², …, L_max]
 * Negative levels:  mirror of positive, negated.
 *
 * This is the function to call after `computeMinContourLevel` and
 * `computeMaxContourLevel`.
 */
export function buildContourLevels(opts: BuildContourOptions): ContourLevels {
  const { minLevel, maxLevel, nLevels = 12 } = opts;

  if (!(minLevel > 0)) throw new RangeError('minLevel must be positive');
  if (!(maxLevel > minLevel)) {
    throw new RangeError('maxLevel must be greater than minLevel');
  }

  let ratio: number;
  let n: number;

  if (opts.ratio !== undefined) {
    ratio = opts.ratio;
    if (!(ratio > 1)) throw new RangeError('ratio must be > 1');
    n = Math.max(
      1,
      Math.floor(Math.log(maxLevel / minLevel) / Math.log(ratio)) + 1,
    );
  } else {
    n = Math.max(2, nLevels);
    ratio = (maxLevel / minLevel) ** (1 / (n - 1));
  }

  const positive = Array.from({ length: n }, (_, i) => minLevel * ratio ** i);
  return {
    positive,
    negative: [...positive].toReversed().map((v) => -v),
    ratio,
  };
}

// ─── End-to-end usage example ──────────────────────────────────────────────

/*
import { computeMinContourLevel, computeMaxContourLevel, buildContourLevels } from './autoContourLevel';

// spectrum: your Float64Array (rows × cols, flattened)
// noiseSigma: from your existing noise estimation

const minResult = computeMinContourLevel(spectrum, noiseSigma, {
  signalPurityTarget: 0.5,  // expose to user as "noise cutoff sensitivity"
});

const maxLevel = computeMaxContourLevel(spectrum, 0.999);

const { positive, negative, ratio } = buildContourLevels({
  minLevel: minResult.minLevel,
  maxLevel,
  nLevels: 12,             // expose to user
});

// Log for diagnostics:
console.log(
  `L_min = ${minResult.minLevel.toFixed(2)}  ` +
  `(${minResult.noiseMultiple.toFixed(1)} σ, ` +
  `purity = ${(minResult.signalPurityAtThreshold * 100).toFixed(0)} %, ` +
  `adaptive = ${minResult.dataAdaptive})`
);
console.log(`ratio r = ${ratio.toFixed(3)},  ${positive.length} levels`);

// Pass `positive` and `negative` to your contour renderer.
// Initial user controls:
//   L_min slider  → rerun buildContourLevels with minLevel = slider value
//   L_max slider  → rerun with maxLevel = slider value
//   nLevels       → rerun with nLevels = new value
*/
