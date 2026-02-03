import { rangesToACS } from 'nmr-processing';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/index.ts';

import { useActiveNucleusTab } from './useActiveNucleusTab.ts';
import { usePanelPreferences } from './usePanelPreferences.ts';
import useSpectraByActiveNucleus from './useSpectraPerNucleus.ts';

export function usePublicationStrings() {
  const spectra = useSpectraByActiveNucleus();
  const activeTab = useActiveNucleusTab();
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const output: Record<string, string> = {};

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) {
      continue;
    }
    const { id: spectrumKey, info, ranges } = spectrum;

    if (!Array.isArray(ranges?.values) || ranges.values.length === 0) {
      continue;
    }

    const { originFrequency: observedFrequency, nucleus } = info;

    const value = rangesToACS(ranges.values, {
      nucleus, // '19f'
      deltaFormat: rangesPreferences.deltaPPM.format,
      couplingFormat: rangesPreferences.coupling.format,
      observedFrequency, //400
    });

    output[spectrumKey] = value;
  }

  return output;
}
