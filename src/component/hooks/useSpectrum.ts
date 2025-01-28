import type { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { useInsetOptions } from '../1d/inset/InsetProvider.js';
import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

function getSpectrum(
  data: Spectrum[],
  spectrumKey: string,
  defaultValue?: any,
) {
  return data.find((datum) => datum.id === spectrumKey) || defaultValue;
}

export default function useSpectrum(defaultValue: any = null) {
  const { data } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const inset = useInsetOptions();

  return useMemo<Spectrum>(() => {
    if (inset) {
      return getSpectrum(data, inset.spectrumKey, defaultValue);
    }

    if (data && activeSpectrum?.id && activeSpectrum?.selected) {
      return getSpectrum(data, activeSpectrum.id, defaultValue);
    }

    return defaultValue;
  }, [activeSpectrum, data, defaultValue, inset]);
}
