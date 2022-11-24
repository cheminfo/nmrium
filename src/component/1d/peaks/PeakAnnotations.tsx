import { useMemo } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useSpectrum from '../../hooks/useSpectrum';
import { useActiveSpectrum } from '../../reducer/Reducer';
import getVerticalShift from '../utilities/getVerticalShift';

import PeakAnnotation from './PeakAnnotation';

const emptyData = { peaks: {}, info: {}, display: {} };

function PeakAnnotations() {
  const { verticalAlign, displayerKey } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { scaleX, scaleY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Datum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();

  const Peaks = useMemo(() => {
    const getVerticalAlign = () => {
      return getVerticalShift(verticalAlign, { index: activeSpectrum?.index });
    };
    if (
      !spectrum?.peaks?.values ||
      !spectrum.display.isVisible ||
      !peaksViewState.isPeaksVisible
    ) {
      return null;
    }

    return (
      <g transform={`translate(0,-${getVerticalAlign()})`}>
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
    verticalAlign,
    activeSpectrum?.index,
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
