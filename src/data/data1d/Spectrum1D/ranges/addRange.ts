import { xyIntegration } from 'ml-spectra-processing';

import { DatumKind } from '../../../constants/SignalsKinds';
import { Datum1D } from '../../../types/data1d/Datum1D';
import generateID from '../../../utilities/generateID';

import detectSignal from './detectSignal';
import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

interface AddRangeOptions {
  from: number;
  to: number;
}

export function addRange(datum: Datum1D, options: AddRangeOptions) {
  const { from, to } = options;
  const { x, re } = datum.data;
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  const signals = detectSignal(x, re, from, to, datum.info.originFrequency);

  try {
    const range = {
      id: generateID(),
      from,
      to,
      absolute, // the real value,
      signals: [{ id: generateID(), ...signals }],
      kind: DatumKind.signal,
      integration: 0,
    };
    datum.ranges.values = datum.ranges.values.concat(mapRanges([range], datum));
    updateRangesRelativeValues(datum);
  } catch (e) {
    throw new Error('Could not calculate the multiplicity');
  }
}
