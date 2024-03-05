import { ZonesViewState } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';

import { useActiveSpectrum } from './useActiveSpectrum';

export const defaultZonesViewState: ZonesViewState = {
  showPeaks: true,
  showSignals: true,
  showZones: true,
};

export function useActiveSpectrumZonesViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { zones },
  } = useChartData();

  if (
    activeSpectrum?.id &&
    activeSpectrum?.selected &&
    zones[activeSpectrum?.id]
  ) {
    return zones[activeSpectrum?.id];
  } else {
    return defaultZonesViewState;
  }
}
