import lodashGet from 'lodash/get.js';
import type { NMRiumPanelPreferences } from 'nmr-load-save';

import { usePreferences } from '../../context/PreferencesContext.js';
import { usePanelOpenState } from '../Panels.js';

export function useTogglePanel() {
  const { dispatch, current } = usePreferences();
  const { setPanelOpenState } = usePanelOpenState();

  function togglePanel(id: keyof NMRiumPanelPreferences) {
    const flag = lodashGet(current, `display.panels.${id}.display`);
    if (typeof flag === 'boolean') {
      setPanelOpenState(id, !flag);
    }

    dispatch({ type: 'TOGGLE_PANEL', payload: { id } });
  }

  return togglePanel;
}
