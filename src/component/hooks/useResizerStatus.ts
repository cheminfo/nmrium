import { useChartData } from '../context/ChartContext.js';
import { useKeyModifiers } from '../context/KeyModifierContext.js';
import type { MainTool } from '../toolbar/ToolTypes.js';

export function useResizerStatus(toolKey: MainTool) {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { shiftKey } = useKeyModifiers();
  return !shiftKey && selectedTool === toolKey;
}
