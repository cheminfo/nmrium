import type { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { useInsetOptions } from '../1d/inset/InsetProvider.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

function getSpectrum(
  data: Spectrum[],
  spectrumKey: string,
  defaultValue?: any,
) {
  return data.find((datum) => datum.id === spectrumKey) || defaultValue;
}

export function useSpectrumWithDataSource(
  dataSource: any,
  defaultValue: any = null,
) {
  const activeSpectrum = useActiveSpectrum();
  const inset = useInsetOptions();

  return useMemo<Spectrum>(() => {
    if (inset) {
      return getSpectrum(dataSource, inset.spectrumKey, defaultValue);
    }

    if (dataSource && activeSpectrum?.id && activeSpectrum?.selected) {
      return getSpectrum(dataSource, activeSpectrum.id, defaultValue);
    }

    return defaultValue;
  }, [activeSpectrum, dataSource, defaultValue, inset]);
}
