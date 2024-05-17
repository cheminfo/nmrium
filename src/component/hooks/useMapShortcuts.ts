import { usePreferences } from '../context/PreferencesContext';

export function useMapShortcuts() {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  function mapShortcuts(shortcuts: string[], options: { shift: boolean }) {
    const { shift } = options;
    const outputShortcuts = [...shortcuts];

    if (shift && !invert) {
      outputShortcuts.unshift('Shift');
    }

    return outputShortcuts;
  }

  return { mapShortcuts };
}
