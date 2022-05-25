import { NMRRange, rangesToXY } from 'nmr-processing';

import { UsedColors } from '../../../../types/UsedColors';
import { Datum1D, Range } from '../../../types/data1d';
import { initiateDatum1D } from '../initiateDatum1D';

import { mapRanges } from './mapRanges';

const defaultFromTo = (nucleus: string) => {
  switch (nucleus.toUpperCase()) {
    case '13C':
      return { from: -5, to: 206 };
    default:
      return { from: -0.5, to: 10.5 };
  }
};

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
    ...getFromTo(ranges, defaultFromTo(nucleus)),
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

function getFromTo(ranges: NMRRange[], fromTo: { from: number; to: number }) {
  let from = Number.MAX_SAFE_INTEGER;
  let to = Number.MIN_SAFE_INTEGER;
  for (const range of ranges) {
    for (const signal of range.signals || []) {
      if (from > signal.delta) from = signal.delta;
      if (to < signal.delta) to = signal.delta;
    }
  }

  return {
    from: Math.min(from - 0.5, fromTo.from),
    to: Math.max(to + 0.5, fromTo.to),
  };
}
