import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotations from './PeakAnnotations';
import PeakAnnotationsSpreadMode from './PeakAnnotationsSpreadMode';

const emptyData = { peaks: {}, info: {}, display: {} };

export function Peaks() {
  const {
    view: { peaks },
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();

  if (
    !spectrum.peaks?.values ||
    !spectrum.display.isVisible ||
    !peaksViewState.isPeaksVisible ||
    spectrum.info?.isFid
  ) {
    return null;
  }

  const mode = peaks?.[spectrum.id]?.displayingMode || 'spread';

  if (mode === 'spread') {
    return <PeakAnnotationsSpreadMode />;
  }

  return <PeakAnnotations />;
}
