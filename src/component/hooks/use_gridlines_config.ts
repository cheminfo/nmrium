import { usePreferences } from '../context/PreferencesContext.tsx';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.ts';

export function useGridline1DConfig() {
  const { current } = usePreferences();
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis.gridlines1D;
}

export function useGridline2DConfig() {
  const { current } = usePreferences();
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis.gridlines2D;
}
