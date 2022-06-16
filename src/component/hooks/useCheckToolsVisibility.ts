import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';
import { usePreferences } from '../context/PreferencesContext';

export function useCheckToolsVisibility(): (
  toolKey: keyof NMRiumToolBarPreferences,
) => boolean {
  const preferences = usePreferences();

  return useCallback(
    (toolKey) =>
      lodashGet(preferences.current, `display.toolBarButtons.${toolKey}`, true),
    [preferences],
  );
}
