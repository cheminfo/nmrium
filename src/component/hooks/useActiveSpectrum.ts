import { useChartData } from '../context/ChartContext.js';
import { getActiveSpectrum } from '../reducer/helper/getActiveSpectrum.js';

export function useActiveSpectrum() {
  const state = useChartData();
  return getActiveSpectrum(state);
}
