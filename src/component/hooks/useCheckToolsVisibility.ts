import lodashGet from 'lodash/get';

import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';
import { usePreferences } from '../context/PreferencesContext';

export function useCheckToolsVisibility(): (
  toolKey: keyof NMRiumToolBarPreferences,
) => boolean {
  const preferences = usePreferences();

  return (toolKey) =>
    lodashGet(preferences.current, `display.toolBarButtons.${toolKey}`, true);
}
