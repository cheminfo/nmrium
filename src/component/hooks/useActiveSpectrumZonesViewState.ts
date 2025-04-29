import type { ZonesViewState } from '@zakodium/nmrium-core';

import { useChartData } from '../context/ChartContext.js';

import { useActiveSpectrum } from './useActiveSpectrum.js';

export const defaultZonesViewState: ZonesViewState = {
  showPeaks: true,
  showSignals: true,
  showZones: true,
  showAssignmentsLabels: false,
  assignmentsLabelsCoordinates: {},
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
