import { Logger } from 'cheminfo-types';
import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { mapRanges, Range, Signal1D } from 'nmr-processing';

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
