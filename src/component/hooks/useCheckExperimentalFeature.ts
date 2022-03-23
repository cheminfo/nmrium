import lodashGet from 'lodash/get';

import { usePreferences } from '../context/PreferencesContext';

export default function useCheckExperimentalFeature(): boolean {
  const preferences = usePreferences();
  const value = lodashGet(
    preferences.current,
    'display.general.experimentalFeatures',
    false,
  );

  if (value?.hidden === true || value?.display === false) {
    return false;
  }

  return true;
}
