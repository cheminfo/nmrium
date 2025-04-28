import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';

import { usePreferences } from '../../context/PreferencesContext.js';
import { usePanelOpenState } from '../Panels.js';

export function useTogglePanel() {
  const { dispatch, current } = usePreferences();
  const { setPanelOpenState } = usePanelOpenState();

  function togglePanel(id: keyof NMRiumPanelPreferences) {
    // TODO: make sure current is not a lie and remove the optional chaining.
    const flag = current?.display?.panels?.[id]?.display;
    if (typeof flag === 'boolean') {
      setPanelOpenState(id, !flag);
    }

    dispatch({ type: 'TOGGLE_PANEL', payload: { id } });
  }

  return togglePanel;
}
