import { useChartData } from '../context/ChartContext.js';

import { useSpectrumWithDataSource } from './useSpectrumWithDataSource.js';

export default function useTempSpectrum(defaultValue: any = null) {
  const { tempData } = useChartData();
  return useSpectrumWithDataSource(tempData, defaultValue);
}
