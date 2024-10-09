import { usePreferences } from '../context/PreferencesContext';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties';

export function useWorkspaceExportSettings() {
  const { current } = usePreferences();
  const defaultOptions = { ...workspaceDefaultProperties.export };

  return current?.export || defaultOptions;
}
