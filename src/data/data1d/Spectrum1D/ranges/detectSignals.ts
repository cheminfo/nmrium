import { DataXY } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

import { detectSignalsByMultipletAnalysis } from './detectSignalsByMultipletAnalysis';
import { getMassCenter } from './utils/getMassCenter';

const MAX_LENGTH = 4092;
export default function detectSignals(
  data: DataXY<Float64Array>,
  options: {
    from: number;
    to: number;
    nucleus: string;
    frequency: number;
  },
) {
  const { from, to, frequency, nucleus } = options;

  const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
  const nbPoints = toIndex - fromIndex;

  if (nbPoints < 7) {
    return [
      {
        delta: getMassCenter(data, { from: fromIndex, to: toIndex }),
        multiplicity: '',
        js: [],
      },
    ];
  }

  if (nbPoints >= MAX_LENGTH) {
    const ranges = xyAutoRangesPicking(data, {
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
