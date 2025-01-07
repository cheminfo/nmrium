import { usePreferences } from '../../context/PreferencesContext.js';

export function useTogglePanel() {
  const { dispatch } = usePreferences();

  function togglePanel(id?: string) {
    if (!id) {
      return;
    }

    dispatch({ type: 'TOGGLE_PANEL', payload: { id } });
  }

  return togglePanel;
}
