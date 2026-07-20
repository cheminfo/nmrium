import { isSpectrum1D } from '@zakodium/nmrium-core';

import { useActiveSpectrumIntegralsViewState } from './useActiveSpectrumIntegralsViewState.js';
import { useActiveSpectrumRangesViewState } from './useActiveSpectrumRangesViewState.js';
import useSpectrum from './useSpectrum.js';

export function useSpectraBottomMargin() {
  const spectrum = useSpectrum();
  const rangesView = useActiveSpectrumRangesViewState();
  const integralsView = useActiveSpectrumIntegralsViewState();

  if (
    isSpectrum1D(spectrum) &&
    ((spectrum.ranges.values.length > 0 && rangesView?.showIntegralsValues) ||
      (spectrum.integrals.values.length > 0 &&
        integralsView?.showIntegralsValues))
  ) {
    return 40;
  }

  return 10;
}
