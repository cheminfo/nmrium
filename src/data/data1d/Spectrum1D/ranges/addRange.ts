import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Signal1D, mapRanges } from 'nmr-processing';

import { DATUM_KIND } from '../../../constants/signalsKinds';

import detectSignals from './detectSignals';

interface RangeOptions {
  from: number;
  to: number;
}

export function createRangeObj({
  from,
  to,
  absolute,
  signals,
}: RangeOptions & { signals: Array<Omit<Signal1D, 'id'>>; absolute: number }) {
  return {
    id: v4(),
    from,
    to,
    absolute, // the real value,
    signals: signals.map((signal) => ({ id: v4(), ...signal })),
    kind: DATUM_KIND.signal,
    integration: 0,
  };
}

export function addRange(spectrum: Spectrum1D, options: RangeOptions) {
  const { from, to } = options;
  const { x, re: y } = spectrum.data;
  const { nucleus, originFrequency: frequency } = spectrum.info;

  const absolute = xyIntegration({ x, y }, { from, to, reverse: true });

  const signals =
    detectSignals(
      { x, y },
      {
        from,
        to,
        nucleus,
        frequency,
      },
    ) || [];

  const range = {
    from,
    to,
    absolute,
    signals,
  };

  try {
    spectrum.ranges.values = spectrum.ranges.values.concat(
      mapRanges([range], spectrum),
    );
  } catch (error) {
    reportError(error);
    throw new Error('Could not calculate the multiplicity');
  }
}
