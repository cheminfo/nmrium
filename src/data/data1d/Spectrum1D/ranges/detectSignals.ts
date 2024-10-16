import type { DataXY, Logger } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

import { detectSignalsByMultipletAnalysis } from './detectSignalsByMultipletAnalysis.js';

const MAX_LENGTH = 4092;
export default function detectSignals(
  data: DataXY<Float64Array>,
  options: {
    from: number;
    to: number;
    logger?: Logger;
    nucleus: string;
    frequency: number;
  },
) {
  const { from, to, frequency, nucleus, logger } = options;

  const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
  const size = toIndex - fromIndex;
  if (size <= 16 || size >= MAX_LENGTH) {
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
        clean: 0.3,
      },
    });
    return ranges
      .flatMap((r) => r.signals || [])
      .map((s) => ({ multiplicity: '', js: [], ...s }));
  } else {
    return detectSignalsByMultipletAnalysis(data, {
      ...options,
      fromIndex,
      toIndex,
    });
  }
}
