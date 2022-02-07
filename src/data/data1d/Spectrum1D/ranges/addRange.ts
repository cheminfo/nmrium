import { xyIntegration } from 'ml-spectra-processing';

import { DatumKind } from '../../../constants/SignalsKinds';
import { Datum1D } from '../../../types/data1d/Datum1D';
import generateID from '../../../utilities/generateID';
import { initSumOptions, SumParams } from '../SumManager';

import detectSignal from './detectSignal';
import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

interface AddRangeOptions {
  from: number;
  to: number;
}

export function addRange(datum: Datum1D, options: AddRangeOptions & SumParams) {
  const { from, to, molecules, nucleus } = options;
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
  if (!signal) return;
  try {
    const range = {
      id: generateID(),
      from,
      to,
      absolute, // the real value,
      signals: [{ id: generateID(), ...signal }],
      kind: DatumKind.signal,
      integration: 0,
    };

    datum.ranges.options = initSumOptions(datum.ranges.options, {
      molecules,
      nucleus,
    });

    datum.ranges.values = datum.ranges.values.concat(mapRanges([range], datum));
    updateRangesRelativeValues(datum);
  } catch (e) {
    throw new Error('Could not calculate the multiplicity');
  }
}
