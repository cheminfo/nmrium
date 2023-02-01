import { useChartData } from '../context/ChartContext';
import { getActiveSpectra } from '../reducer/helper/getActiveSpectra';

export function useActiveSpectra() {
  const state = useChartData();
  return getActiveSpectra(state);
}
