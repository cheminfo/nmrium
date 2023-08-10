import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Signal1D, mapRanges } from 'nmr-processing';

import { DatumKind } from '../../../constants/SignalsKinds';

import detectSignal from './detectSignal';

interface RangeOptions {
  from: number;
  to: number;
}

export function createRangeObj({
  from,
  to,
  absolute,
  signal,
}: RangeOptions & { signal: Omit<Signal1D, 'id'>; absolute: number }) {
  return {
    id: v4(),
    from,
    to,
    absolute, // the real value,
    signals: [{ id: v4(), ...signal }],
    kind: DatumKind.signal,
    integration: 0,
  };
}

export function addRange(spectrum: Spectrum1D, options: RangeOptions) {
  const { from, to } = options;
  const { x, re } = spectrum.data;
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  // detectSignal use the advance multiplet-analysis that can crash if too many points
  const signal = detectSignal(
    { x, re },
    {
      from,
      to,
      frequency: spectrum.info.originFrequency,
    },
  );

  let range;

  if (signal) {
    range = createRangeObj({
      from,
      to,
      absolute,
      signal,
    });
  }

  try {
    if (range) {
      spectrum.ranges.values = spectrum.ranges.values.concat(
        mapRanges([range], spectrum),
      );
    }
  } catch (error) {
    reportError(error);
    throw new Error('Could not calculate the multiplicity');
  }
}
