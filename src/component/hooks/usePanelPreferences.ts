import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';

export function usePanelPreferences(key: string) {
  const preferences = usePreferences();

  return useMemo(() => {
    return preferences.formatting.panels[key] || null;
  }, [key, preferences.formatting.panels]);
}
