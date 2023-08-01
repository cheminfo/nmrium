import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotations from './PeakAnnotations';
import PeakAnnotationsTreeStyle from './PeakAnnotationsTreeStyle';

export function PeaksGroup() {
  const {
    view: { peaks },
  } = useChartData();
  const spectrum = useSpectrum();

  const mode = peaks?.[spectrum.id]?.displayingMode || 'single';

  if (mode === 'group') {
    return <PeakAnnotationsTreeStyle />;
  }

  return <PeakAnnotations />;
}
