import type { DataXY, Logger } from 'cheminfo-types';
import median from 'ml-array-median';
import { xGetFromToIndex, xyMaxYPoint } from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

import { detectSignalsByMultipletAnalysis } from './detectSignalsByMultipletAnalysis.js';

const MAX_LENGTH = 4092;

/**
 * Factor applied to the baseline noise of the whole spectrum to build the
 * peak picking threshold used inside a range.
 *
 * The threshold must not be derived from the range itself: in a narrow range
 * most of the points belong to the peaks, so a "noise" estimated from them is
 * close to (or bigger than) the peak height and nothing is detected.
 */
const RANGE_PEAK_NOISE_FACTOR = 8;

/**
 * Baseline noise of the spectrum: absolute median of the intensity, as in
 * `autoPeakPicking`. It is robust to the presence of intense peaks and it does
 * not depend on the range being analysed.
 */
export function getBaselineNoise(y: Float64Array) {
  return (
    median(Array.from(y, (value) => Math.abs(value))) * RANGE_PEAK_NOISE_FACTOR
  );
}

interface DetectSignalsOptions {
  from: number;
  to: number;
  logger?: Logger;
  nucleus: string;
  frequency: number;
}

export default function detectSignals(
  data: DataXY<Float64Array>,
  options: DetectSignalsOptions,
) {
  const { from, to, frequency, nucleus, logger } = options;

  const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
  const noiseLevel = getBaselineNoise(data.y);
  const size = toIndex - fromIndex;

  const signals =
    size <= 16 || size >= MAX_LENGTH
      ? detectSignalsByAutoRangesPicking(data, {
          from,
          to,
          frequency,
          nucleus,
          noiseLevel,
          logger,
        })
      : detectSignalsByMultipletAnalysis(data, {
          fromIndex,
          toIndex,
          frequency,
          noiseLevel,
        });

  if (signals.length > 0) {
    return signals;
  }

  // The range may be too narrow (or its signals too weak) for the multiplet
  // analysis. When there is something above the baseline inside it, the point
  // of maximum intensity is reported as a signal of unknown multiplicity, so
  // that the range is never left without a signal. A range that only contains
  // noise stays empty.
  const maxPoint = xyMaxYPoint(data, { fromIndex, toIndex });
  if (maxPoint.y > noiseLevel) {
    logger?.warn(
      'No signal could be detected inside the range: it may be too narrow or its signals too weak for the multiplet analysis. The point of maximum intensity is used as signal.',
    );
    return [
      {
        delta: maxPoint.x,
        multiplicity: '',
        kind: 'signal' as const,
        js: [],
        diaIDs: [],
        peaks: [],
      },
    ];
  }

  return signals;
}

interface DetectSignalsByAutoRangesPickingOptions {
  from: number;
  to: number;
  frequency: number;
  nucleus: string;
  noiseLevel: number;
  logger?: Logger;
}

function detectSignalsByAutoRangesPicking(
  data: DataXY<Float64Array>,
  options: DetectSignalsByAutoRangesPickingOptions,
) {
  const { from, to, frequency, nucleus, noiseLevel, logger } = options;
  const frequencyCluster = (to - from) * frequency;
  const ranges = xyAutoRangesPicking(data, {
    logger,
    peakPicking: {
      sgOptions: {
        windowSize: 7,
        polynomial: 3,
      },
      to,
      from,
      frequency,
      noiseLevel,
      broadRatio: 0.0025,
      smoothY: true,
    },
    ranges: {
      symRatio: 2.5,
      frequency,
      nucleus,
      compile: true,
      frequencyCluster,
      keepPeaks: true,
      clean: 0.5,
    },
  });
  return ranges
    .flatMap((r) => r.signals || [])
    .map((s) => ({ multiplicity: '', js: [], ...s }));
}
