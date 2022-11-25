import { usePreferences } from '../context/PreferencesContext';

export default function useCheckExperimentalFeature(): boolean {
  const preferences = usePreferences();
  return (
    preferences.current.display.general?.experimentalFeatures?.display || false
  );
}
