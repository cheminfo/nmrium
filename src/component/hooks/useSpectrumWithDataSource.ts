import type { Spectrum } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import { useInsetOptions } from '../1d/inset/InsetProvider.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

function getSpectrum<Default>(
  data: Spectrum[],
  spectrumKey: string,
  defaultValue: Default,
) {
  return data.find((datum) => datum.id === spectrumKey) || defaultValue;
}

export function useSpectrumWithDataSource<Default = Spectrum>(
  dataSource: Spectrum[],
  defaultValue: Default | null = null,
) {
  const activeSpectrum = useActiveSpectrum();
  const inset = useInsetOptions();

  return useMemo<Spectrum | Default | null>(() => {
    if (!dataSource) return defaultValue;

    if (inset) {
      return getSpectrum<Default | null>(
        dataSource,
        inset.spectrumKey,
        defaultValue,
      );
    }

    if (dataSource && activeSpectrum?.selected) {
      return getSpectrum<Default | null>(
        dataSource,
        activeSpectrum.id,
        defaultValue,
      );
    }

    return defaultValue;
  }, [activeSpectrum, dataSource, defaultValue, inset]);
}
