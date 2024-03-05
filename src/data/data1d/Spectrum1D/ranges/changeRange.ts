import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import {
  Range,
  Signal1D,
  mapRanges,
  updateRangesRelativeValues,
} from 'nmr-processing';

import detectSignals from './detectSignals';

export function changeRange(spectrum: Spectrum1D, range: Range) {
  const { from, to, id } = range;
  const { x, re: y } = spectrum.data;
  const { originFrequency: frequency, nucleus } = spectrum.info;

  const index = spectrum.ranges.values.findIndex((i) => i.id === id);
  const absolute = xyIntegration({ x, y }, { from, to, reverse: true });

  const signals = detectSignals(
    { x, y },
    {
      from,
      to,
      nucleus,
      frequency,
    },
  ) as Signal1D[];

  if (index !== -1) {
    const [newRange] = mapRanges(
      [
        {
          ...spectrum.ranges.values[index],
          originalFrom: from,
          originalTo: to,
          ...range,
          absolute,
          signals,
        },
      ],
      spectrum,
    );

    if (newRange) {
      spectrum.ranges.values[index] = newRange;
      updateRangesRelativeValues(spectrum);
    }
  }
}
