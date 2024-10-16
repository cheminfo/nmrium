import { usePreferences } from '../context/PreferencesContext.js';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.js';

export function useWorkspaceExportSettings() {
  const { current } = usePreferences();
  const defaultOptions = { ...workspaceDefaultProperties.export };

  return current?.export || defaultOptions;
}
