import type { NMRiumToolBarPreferences } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext.js';
import { useKeyModifiers } from '../context/KeyModifierContext.js';

export function useResizerStatus(toolKey: keyof NMRiumToolBarPreferences) {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { shiftKey } = useKeyModifiers();
  return !shiftKey && selectedTool === toolKey;
}
