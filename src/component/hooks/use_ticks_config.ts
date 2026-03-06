import { usePreferences } from '../context/PreferencesContext.tsx';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.ts';

export function useTicksConfig() {
  const { current } = usePreferences();
  const axis = current.axis ?? workspaceDefaultProperties.axis;

  const { textStyle } = axis.primaryTicks;
  const { enabled } = axis.secondaryTicks;

  return {
    textStyle,
    isSecondaryEnabled: enabled,
  };
}
