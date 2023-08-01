import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotations from './PeakAnnotations';
import PeakAnnotationsTreeStyle from './PeakAnnotationsTreeStyle';

const emptyData = { peaks: {}, info: {}, display: {} };

export function PeaksGroup() {
  const {
    view: { peaks },
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();

  if (
    !spectrum?.peaks?.values ||
    !spectrum.display.isVisible ||
    !peaksViewState.isPeaksVisible
  ) {
    return null;
  }

  const mode = peaks?.[spectrum.id]?.displayingMode || 'single';

  if (mode === 'group') {
    return <PeakAnnotationsTreeStyle />;
  }

  return <PeakAnnotations />;
}
