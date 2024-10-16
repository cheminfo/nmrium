import { useChartData } from '../context/ChartContext.js';
import { getVerticalAlign } from '../reducer/helper/getVerticalAlign.js';

export function useVerticalAlign() {
  const state = useChartData();

  return getVerticalAlign(state);
}
