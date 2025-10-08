import { useChartData } from '../context/ChartContext.tsx';

export function useActiveNucleusTab() {
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  return activeTab;
}
