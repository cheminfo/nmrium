import { useChartData } from '../context/ChartContext.js';
import { getActiveSpectra } from '../reducer/helper/getActiveSpectra.js';

export function useActiveSpectra() {
  const state = useChartData();
  return getActiveSpectra(state);
}
