import { Range, Spectrum1D } from 'nmr-load-save';
import { rangesToXY } from 'nmr-processing';

import { UsedColors } from '../../../../types/UsedColors';
import { initiateDatum1D } from '../initiateDatum1D';

export interface ResurrectSpectrumInfo {
  nucleus: string;
  solvent: string;
  name?: string;
  frequency?: number;
  color?: string;
}

export function generateSpectrumFromRanges(
  ranges: Range[],
  info: ResurrectSpectrumInfo,
  usedColors: UsedColors,
): Spectrum1D {
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
