import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { mapRanges } from 'nmr-processing';

import detectSignals from './detectSignals';

interface RangeOptions {
  from: number;
  to: number;
}

export function addRange(spectrum: Spectrum1D, options: RangeOptions) {
  const { from, to } = options;
  const { x, re: y } = spectrum.data;
  const { nucleus, originFrequency: frequency } = spectrum.info;

  const absolute = xyIntegration({ x, y }, { from, to });

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
      // TODO: Check this error.
      // @ts-expect-error To be checked
      mapRanges([range], spectrum),
    );
  } catch (error) {
    reportError(error);
    throw new Error('Could not calculate the multiplicity');
  }
}
