import type { ACSExportOptions, Spectrum } from '@zakodium/nmrium-core';
import { assertSpectrum1D, isSpectrum1D } from '@zakodium/nmrium-core';
import type { RangesToACSOptions } from 'nmr-processing';
import { rangesToACS } from 'nmr-processing';

import useSpectraByActiveNucleus from './useSpectraPerNucleus.ts';
import { useActiveACSSettings } from './use_acs_settings.ts';

export function usePublicationStrings() {
  const spectra = useSpectraByActiveNucleus();
  const acs = useActiveACSSettings();

  const output: Record<string, string> = {};

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;

    const { id, ranges } = spectrum;

    if (!Array.isArray(ranges?.values) || ranges.values.length === 0) {
      continue;
    }

    output[id] = buildPublicationString({ spectrum, acs });
  }

  return output;
}

interface BuildPublicationStringOptions {
  spectrum: Spectrum;
  acs: ACSExportOptions;
}
export function buildPublicationString(options: BuildPublicationStringOptions) {
  const { spectrum, acs } = options;
  assertSpectrum1D(spectrum);

  const {
    info,
    ranges: { values },
  } = spectrum;
  const { originFrequency, nucleus } = info;
  const { signalKind, format, couplingFormat, ...otherOptions } = acs;

  const ranges =
    signalKind === 'all'
      ? values
      : values.filter((range) =>
          range.signals?.some((signal) => signal.kind === 'signal'),
        );

  const rangesToACSOptions: RangesToACSOptions = {
    nucleus,
    observedFrequency: originFrequency,
    ...otherOptions,
    format: '',
  };

  if (format !== 'D') {
    rangesToACSOptions.format = format;
    rangesToACSOptions.couplingFormat = couplingFormat;
  }

  return rangesToACS(ranges, rangesToACSOptions);
}
