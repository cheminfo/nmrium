import type { DataXY, Logger } from 'cheminfo-types';
import {
  xAbsoluteMedian,
  xGetFromToIndex,
  xyMaxYPoint,
} from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

import { RANGE_PEAK_NOISE_FACTOR } from './constants.js';
import { detectSignalsByMultipletAnalysis } from './detectSignalsByMultipletAnalysis.js';

const MAX_LENGTH = 4092;

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
  const noiseLevel = xAbsoluteMedian(data.y) * RANGE_PEAK_NOISE_FACTOR;
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
