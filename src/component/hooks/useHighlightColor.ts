import { usePreferences } from '../context/PreferencesContext.js';

export function useHighlightColor() {
  const { current } = usePreferences();
  return current?.spectraColors?.highlightColor || '#ffd700';
}
