import { IntegralsViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

export const defaultIntegralsViewState: IntegralsViewState = {
  scaleRatio: 1,
  showIntegralsValues: true,
};

export function useActiveSpectrumIntegralsViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { integrals },
  } = useChartData();

  if (
    activeSpectrum?.id &&
    activeSpectrum?.selected &&
    integrals[activeSpectrum?.id]
  ) {
    return integrals[activeSpectrum?.id];
  } else {
    return defaultIntegralsViewState;
  }
}
