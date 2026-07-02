import { usePreferences } from '../context/PreferencesContext.tsx';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.ts';

export function useTicksConfig() {
  const { current } = usePreferences();
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  return axis;
}
