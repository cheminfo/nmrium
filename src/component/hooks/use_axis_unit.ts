import type { AxisUnit } from '@zakodium/nmrium-core';

import { usePreferences } from '../context/PreferencesContext.tsx';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.ts';

export const axisUnitToLabel: Record<AxisUnit, string> = {
  hz: 'time [s]',
  ppm: 'δ [ppm]',
  pt: 'index [pt]',
};

export function useHorizontalAxis1DUnit() {
  const preferences = usePreferences();
  const { current } = preferences;
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis.unit1D.horizontal;
}

export function useDirectAxis2DUnit() {
  const preferences = usePreferences();
  const { current } = preferences;
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis.units2D.direct;
}

export function useIndirectAxis2DUnit() {
  const preferences = usePreferences();
  const { current } = preferences;
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis.units2D.indirect;
}
