import { usePreferences } from '../context/PreferencesContext';

export function useHighlightColor() {
  const { current } = usePreferences();
  return current?.spectraColors?.highlightColor || '#ffd700';
}
