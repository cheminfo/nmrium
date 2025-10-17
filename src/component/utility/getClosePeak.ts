import type { Spectrum1D } from '@zakodium/nmrium-core';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/index.js';

import { maxAbsoluteValue } from './maxAbsoluteValue.js';

interface PeakPosition {
  x: number;
  y: number;
}

export function getClosePeak(
  spectrum: Spectrum1D,
  lookRange: {
    from: number;
    to: number;
  },
): PeakPosition | null {
  const { from, to } = lookRange;
  const datum = get1DDataXY(spectrum);
  const maxIndex = datum.x.findIndex((number) => number >= to) - 1;
  const minIndex = datum.x.findIndex((number) => number >= from);

  const yDataRange = datum.y.slice(minIndex, maxIndex);
  if (yDataRange.length === 0) return null;

  const y = maxAbsoluteValue(yDataRange);
  const xIndex = minIndex + yDataRange.indexOf(y);
  const x = datum.x[xIndex];

  return { x, y };
}
