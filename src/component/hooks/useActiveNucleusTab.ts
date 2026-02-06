import { useChartData } from '../context/ChartContext.js';

export function useActiveNucleusTab() {
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  return activeTab;
}
