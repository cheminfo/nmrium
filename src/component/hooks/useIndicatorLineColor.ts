import { usePreferences } from '../context/PreferencesContext.js';

export function useIndicatorLineColor() {
  const { current } = usePreferences();
  return current?.spectraColors?.indicatorLineColor || '#2FFF0085';
}
