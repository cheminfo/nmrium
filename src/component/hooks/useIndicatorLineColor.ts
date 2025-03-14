import { usePreferences } from '../context/PreferencesContext.js';

export function useIndicatorLineColor() {
  const { current } = usePreferences();
  return current?.spectraColors?.indicatorLineColor || '#ED7014';
}
