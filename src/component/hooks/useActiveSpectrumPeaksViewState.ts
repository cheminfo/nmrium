import { PeaksViewState } from '../../data/types/view-state/PeaksViewState';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectrum } from '../reducer/Reducer';

export const defaultPeaksViewState: PeaksViewState = {
  isPeaksVisible: true,
  showPeaksShapes: false,
  showPeaksSum: false,
};

export function useActiveSpectrumPeaksViewState() {
  const activeSpectrum = useActiveSpectrum();
  const {
    view: { peaks },
  } = useChartData();

  if (activeSpectrum?.id && peaks[activeSpectrum?.id]) {
    return peaks[activeSpectrum?.id];
  } else {
    return defaultPeaksViewState;
  }
}
