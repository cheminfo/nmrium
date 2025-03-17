import { usePreferences } from '../context/PreferencesContext.js';

export function useIndicatorLineColor() {
  const { current } = usePreferences();
  console.log(current?.spectraColors);
  return current?.spectraColors?.indicatorLineColor || '#2FFF0085';
}
