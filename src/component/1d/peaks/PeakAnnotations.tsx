import type { Spectrum1D } from 'nmr-processing';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotation from './PeakAnnotation';

const emptyData = { peaks: {}, info: {}, display: {} };

function PeakAnnotations() {
  const { displayerKey } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { scaleX, scaleY, shiftY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();

  const Peaks = useMemo(() => {
    if (
      !spectrum?.peaks?.values ||
      !spectrum.display.isVisible ||
      !peaksViewState.isPeaksVisible
    ) {
      return null;
    }

    return (
      <g transform={`translate(0,-${(activeSpectrum?.index || 0) * shiftY})`}>
        {spectrum.peaks.values.map(({ x, y, id }) => (
          <PeakAnnotation
            key={id}
            x={scaleX()(x)}
            y={scaleY(spectrum.id)(y) - 5}
            sign={Math.sign(y)}
            id={id}
            value={x}
            color="#730000"
            nucleus={spectrum.info.nucleus}
          />
        ))}
      </g>
    );
  }, [
    spectrum.peaks.values,
    spectrum.display.isVisible,
    spectrum.id,
    spectrum.info.nucleus,
    peaksViewState.isPeaksVisible,
    activeSpectrum?.index,
    shiftY,
    scaleX,
    scaleY,
  ]);

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {Peaks}
    </g>
  );
}

export default PeakAnnotations;
