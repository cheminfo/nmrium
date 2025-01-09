import type { DisplayerMode } from '../reducer/Reducer.js';

import type { AccordionItem } from './accordionItems.js';

export function checkAccordionItemMode(
  item: AccordionItem,
  displayerMode: DisplayerMode,
) {
  return item.mode == null || item.mode === displayerMode;
}
