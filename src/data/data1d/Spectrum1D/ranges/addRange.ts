import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';

import { DatumKind } from '../../../constants/SignalsKinds';
import { Signal1D } from '../../../types/data1d';
import { Datum1D } from '../../../types/data1d/Datum1D';
import { initSumOptions, SumParams } from '../SumManager';

import detectSignal from './detectSignal';
import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

interface RangeOptions {
  from: number;
  to: number;
  id?: string;
}

export function createRangeObj({
  from,
  to,
  absolute,
  id,
  signal,
}: RangeOptions & { signal: Omit<Signal1D, 'id'>; absolute: number }) {
  return {
    id: id ? id : v4(),
    from,
    to,
    absolute, // the real value,
    signals: [{ id: v4(), ...signal }],
    kind: DatumKind.signal,
    integration: 0,
  };
}

export function addRange(datum: Datum1D, options: RangeOptions & SumParams) {
  const { from, to, id, molecules, nucleus } = options;
  const { x, re } = datum.data;
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  // detectSignal use the advance multiplet-analysis that can crash if too many points
  const signal = detectSignal(
    x as unknown as Float64Array,
    re as unknown as Float64Array,
    from,
    to,
    datum.info.originFrequency,
  );

  let range;

  if (!signal) {
    if (id === 'new') {
      range = createRangeObj({
        from,
        to,
        id,
        absolute,
        signal: { multiplicity: 's', kind: 'signal', delta: 0, js: [] },
      });
    }
  } else {
    range = createRangeObj({
      from,
      to,
      id,
      absolute,
      signal,
    });
  }

  try {
    if (range) {
      datum.ranges.options = initSumOptions(datum.ranges.options, {
        molecules,
        nucleus,
      });

      datum.ranges.values = datum.ranges.values.concat(
        mapRanges([range], datum),
      );
      updateRangesRelativeValues(datum);
    }
  } catch (e) {
    throw new Error('Could not calculate the multiplicity');
  }
}
