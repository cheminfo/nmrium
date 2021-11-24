import { xyIntegration } from 'ml-spectra-processing';

import { Datum1D, Range } from '../../../types/data1d';

import { updateRangesRelativeValues } from './updateRangesRelativeValues';

export function changeRange(datum: Datum1D, range: Range) {
  const { from, to } = range;
  const { x, re } = datum.data;

  const index = datum.ranges.values.findIndex((i) => i.id === range.id);
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  if (index !== -1) {
    datum.ranges.values[index] = {
      ...datum.ranges.values[index],
      originFrom: from,
      originTo: to,
      ...range,
      absolute,
    };
    updateRangesRelativeValues(datum);
  }
}
