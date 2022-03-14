import lodashGet from 'lodash/get';
import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';

export default function useCheckExperimentalFeature(): boolean {
  const preferences = usePreferences();
  return useMemo(() => {
    return (
      lodashGet(preferences, 'display.general.experimentalFeatures', false) ===
      true
    );
  }, [preferences]);
}
