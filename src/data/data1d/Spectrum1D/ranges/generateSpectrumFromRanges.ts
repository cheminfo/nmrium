import { rangesToXY } from 'nmr-processing';

import { UsedColors } from '../../../../types/UsedColors';
import { Datum1D, Range } from '../../../types/data1d';
import { initiateDatum1D } from '../initiateDatum1D';

import { mapRanges } from './mapRanges';

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
      display: { name },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: '',
        solvent,
        isFt: true,
      },
    },
    usedColors,
  );
  datum.ranges.values = mapRanges(ranges, datum);

  return datum;
}
