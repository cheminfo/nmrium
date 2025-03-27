import { useChartData } from '../context/ChartContext.js';

import { useSpectrumWithDataSource } from './useSpectrumWithDataSource.js';

export default function useSpectrum(defaultValue: any = null) {
  const { data } = useChartData();
  return useSpectrumWithDataSource(data, defaultValue);
}
