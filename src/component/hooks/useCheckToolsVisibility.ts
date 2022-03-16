import lodashGet from 'lodash/get';

import { usePreferences } from '../context/PreferencesContext';

export function useCheckToolsVisibility(): (toolKey: string) => boolean {
  const preferences = usePreferences();

  return (toolKey) =>
    lodashGet(preferences.current, `display.toolBarButtons.${toolKey}`, true);
}
