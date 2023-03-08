import { rangesToXY } from 'nmr-processing';

import { UsedColors } from '../../../../types/UsedColors';
import { Datum1D, Range } from '../../../types/data1d';
import { initiateDatum1D } from '../initiateDatum1D';

export function generateSpectrumFromRanges(
  ranges: Range[],
  info: {
    nucleus: string;
    solvent: string;
    name?: string;
    frequency?: number;
    color?: string;
  },
  usedColors: UsedColors,
): Datum1D {
  const { nucleus, solvent, name = null, frequency = 400 } = info;

  const { x, y } = rangesToXY(ranges, {
    nucleus,
    frequency,
    nbPoints: 2 ** 17,
  });

  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: '',
        solvent,
        isFt: true,
        name,
      },
      ranges: { values: ranges, options: { sum: 100 } },
    },
    { usedColors },
  );

  return datum;
}
