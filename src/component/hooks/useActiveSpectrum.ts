import { useChartData } from '../context/ChartContext';
import { getActiveSpectrum } from '../reducer/helper/getActiveSpectrum';

export function useActiveSpectrum() {
  const state = useChartData();
  return getActiveSpectrum(state);
}
