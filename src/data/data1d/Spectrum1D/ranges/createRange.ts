import type { Logger } from 'cheminfo-types';
import { xyIntegration } from 'ml-spectra-processing';
import type { Spectrum1D } from 'nmr-load-save';
import type { Range, Signal1D } from 'nmr-processing';
import { mapRanges } from 'nmr-processing';

import detectSignals from './detectSignals.js';

export function cutRange(spectrum: Spectrum1D, x: number) {
  const cutRanges: Record<string, Range[]> = {};

  for (const range of spectrum?.ranges?.values || []) {
    const { to, from, id } = range;
    if (x > from && x < to) {
      const leftRange = createRange(spectrum, { from, to: x });
      const rightRange = createRange(spectrum, {
        from: x,
        to,
      });
      cutRanges[id] = [];
      if (leftRange) {
        cutRanges[id].push(leftRange);
      }
      if (rightRange) {
        cutRanges[id].push(rightRange);
      }
    }
  }
  return cutRanges;
}

export function createRange(
  spectrum: Spectrum1D,
  options: Pick<Range, 'from' | 'to'> & { logger?: Logger },
) {
  const { from, to, logger } = options;
  const { x, re: y } = spectrum.data;
  const { nucleus, originFrequency: frequency } = spectrum.info;

  const absolute = xyIntegration({ x, y }, { from, to });

  const signals =
    detectSignals(
      { x, y },
      {
        logger,
        from,
        to,
        nucleus,
        frequency,
      },
    ) || [];

  const range = {
    from,
    to,
    absolute,
    signals: signals as Signal1D[],
  } as Range;

  try {
    const [newRange] = mapRanges([range], spectrum);
    return newRange;
  } catch (error) {
    reportError(error);
    logger?.error('Could not calculate the multiplicity');
  }
}
