import type { Spectrum1D, Spectrum } from '@zakodium/nmrium-core';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/index.ts';
import { useInsetOptions } from '../1d/inset/InsetProvider.tsx';
import { useChartData } from '../context/ChartContext.tsx';

export function useVisibleSpectra1D() {
  const { xDomains, data, tempData } = useChartData();

  const viewData: Spectrum[] = tempData ?? data;
  const inset = useInsetOptions();

  if (inset) {
    return viewData?.filter(
      (d) => isSpectrum1D(d) && d.id === inset.spectrumKey,
    ) as Spectrum1D[];
  }

  return viewData?.filter(
    (d) => isSpectrum1D(d) && d.display.isVisible && xDomains[d.id],
  ) as Spectrum1D[];
}
