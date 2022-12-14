import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';

import { Datum1D, Range } from '../../../types/data1d';

import detectSignal from './detectSignal';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

export function changeRange(datum: Datum1D, range: Range) {
  const { from, to, id } = range;
  const { x, re } = datum.data;

  const index = datum.ranges.values.findIndex((i) => i.id === id);
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  const signal = detectSignal(x, re, from, to, datum.info.originFrequency);

  if (index !== -1) {
    datum.ranges.values[index] = {
      ...datum.ranges.values[index],
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
          }),
        },
      ],
    };
    updateRangesRelativeValues(datum);
  }
}
