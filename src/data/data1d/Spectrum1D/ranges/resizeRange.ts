import type { Logger } from 'cheminfo-types';
import { xyIntegration } from 'ml-spectra-processing';
import type { Range, Signal1D } from 'nmr-processing';
import { mapRanges } from 'nmr-processing';
import type { Spectrum1D } from 'nmrium-core';

import detectSignals from './detectSignals.js';

export function resizeRange(
  spectrum: Spectrum1D,
  options: { range: Range; from: number; to: number; logger?: Logger },
) {
  const { range, from, to, logger } = options;
  const { x, re: y } = spectrum.data;
  const { originFrequency: frequency, nucleus } = spectrum.info;

  const absolute = xyIntegration({ x, y }, { from, to });

  const signals = detectSignals(
    { x, y },
    {
      from,
      to,
      nucleus,
      frequency,
      logger,
    },
  ) as Signal1D[];

  const [newRange] = mapRanges(
    [
      {
        ...range,
        originalFrom: from,
        originalTo: to,
        from,
        to,
        absolute,
        signals,
      },
    ],
    spectrum,
  );

  return newRange;
}
