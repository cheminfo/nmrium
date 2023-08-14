import { NMRiumToolBarPreferences } from 'nmr-load-save';

import { useChartData } from '../context/ChartContext';
import { useKeyModifiers } from '../context/KeyModifierContext';

export function useResizerStatus(toolKey: keyof NMRiumToolBarPreferences) {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { shiftKey } = useKeyModifiers();
  return !shiftKey && selectedTool === toolKey;
}
