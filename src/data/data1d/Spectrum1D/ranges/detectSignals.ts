import { DataXY } from 'cheminfo-types';
import { xyAutoRangesPicking } from 'nmr-processing';

export const MAX_LENGTH = 4092;

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

  const ranges = xyAutoRangesPicking(data, {
    peakPicking: {
      to,
      from,
      frequency,
    },
    ranges: {
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
}
