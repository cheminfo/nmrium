import lodashGet from 'lodash/get.js';
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

      return lodashGet(
        preferences.current,
        `display.panels.${item.id}`,
        defaultValue,
      );
    },
    [preferences],
  );
}
