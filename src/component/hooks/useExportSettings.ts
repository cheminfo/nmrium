import { ExportPreferences } from 'nmr-load-save';

import { usePreferences } from '../context/PreferencesContext';

const defaultExportSettings: ExportPreferences = {
  png: {
    resolution: 300,
  },
};

export function useExportSettings() {
  const { current } = usePreferences();

  return current?.export || defaultExportSettings;
}
