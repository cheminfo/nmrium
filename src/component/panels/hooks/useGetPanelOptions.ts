import type { PanelPreferencesType } from 'nmr-load-save';
import { useCallback } from 'react';

import { usePreferences } from '../../context/PreferencesContext.js';
import type { AccordionItem } from '../accordionItems.js';

export function useGetPanelOptions(): (
  item: AccordionItem,
) => PanelPreferencesType {
  const preferences = usePreferences();

  return useCallback(
    (item: AccordionItem) => {
      const defaultValue: PanelPreferencesType = {
        display: false,
        visible: false,
        open: false,
      };

      if (item?.isExperimental && !item.id) {
        return {
          display: true,
          visible: true,
          open: false,
        };
      }

      // TODO: make sure preferences are not a lie and remove the optional chaining.
      return preferences?.current?.display?.panels?.[item.id] ?? defaultValue;
    },
    [preferences],
  );
}
