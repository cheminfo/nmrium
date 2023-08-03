import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotation from './PeakAnnotation';

const emptyData = { peaks: {}, info: {}, display: {} };

function PeakAnnotations() {
  const { displayerKey } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { shiftY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <g transform={`translate(0,-${(activeSpectrum?.index || 0) * shiftY})`}>
        {spectrum.peaks.values.map((peak) => (
          <PeakAnnotation
            key={peak.id}
            spectrumId={spectrum.id}
            peak={peak}
            color="#730000"
            nucleus={spectrum.info.nucleus}
          />
        ))}
      </g>
    </g>
  );
}

export default PeakAnnotations;
