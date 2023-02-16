import { useChartData } from '../context/ChartContext';
import { getVerticalAlign } from '../reducer/helper/getVerticalAlign';

export function useVerticalAlign() {
  const state = useChartData();

  return getVerticalAlign(state);
}
