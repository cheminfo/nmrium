import { DataXY } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

import { detectSignalsByMultipletAnalysis } from './detectSignalsByMultipletAnalysis';

const MAX_LENGTH = 4092;
export default function detectSignals(
  data: DataXY,
  options: {
    from: number;
    to: number;
    nucleus: string;
    frequency: number;
  },
) {
  const { from, to, frequency, nucleus } = options;

  const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
  if (toIndex - fromIndex >= MAX_LENGTH) {
    const ranges = xyAutoRangesPicking(data, {
      peakPicking: {
        to,
        from,
        frequency,
      },
      ranges: {
        symRatio: 2.5,
        frequency,
        nucleus,
        compile: true,
        frequencyCluster: 16,
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
