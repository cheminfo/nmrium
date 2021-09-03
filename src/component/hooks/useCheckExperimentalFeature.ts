import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';

export default function useCheckExperimentalFeature(): boolean {
  const preferences = usePreferences();

  return useMemo(() => {
    return preferences?.display.hideExperimentalFeatures;
  }, [preferences]);
}
