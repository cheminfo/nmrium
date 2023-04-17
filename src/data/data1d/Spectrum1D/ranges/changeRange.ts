import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';
import { Range, Spectrum1D } from 'nmr-load-save';

import detectSignal from './detectSignal';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

export function changeRange(spectrum: Spectrum1D, range: Range) {
  const { from, to, id } = range;
  const { x, re } = spectrum.data;

  const index = spectrum.ranges.values.findIndex((i) => i.id === id);
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  const signal = detectSignal(
    { x, re },
    {
      from,
      to,
      frequency: spectrum.info.originFrequency,
      checkMaxLength: false,
    },
  );

  if (index !== -1) {
    spectrum.ranges.values[index] = {
      ...spectrum.ranges.values[index],
      originFrom: from,
      originTo: to,
      ...range,
      absolute,
      signals: [
        {
          id: v4(),
          ...(signal || {
            multiplicity: 's',
            kind: 'signal',
            delta: 0,
            js: [],
            diaIDs: [],
          }),
        },
      ],
    };
    updateRangesRelativeValues(spectrum);
  }
}
