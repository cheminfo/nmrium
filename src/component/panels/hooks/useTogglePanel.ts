import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';

import { usePreferences } from '../../context/PreferencesContext.js';

export function useTogglePanel() {
  const { dispatch, current } = usePreferences();

  function togglePanel(id: keyof NMRiumPanelPreferences) {
    // TODO: make sure current is not a lie and remove the optional chaining.
    const flag = current?.display?.panels?.[id]?.display;
    const isSplitPaneOpen = !current.display.general?.hidePanelOnLoad;

    if (!isSplitPaneOpen) {
      dispatch({ type: 'TOGGLE_SPLIT_PANEL', payload: { isOpen: true } });
    }

    if ((!isSplitPaneOpen && !flag) || isSplitPaneOpen) {
      dispatch({
        type: 'TOGGLE_PANEL',
        payload: { id, options: { display: undefined, open: !flag } },
      });
    }
  }

  return togglePanel;
}
