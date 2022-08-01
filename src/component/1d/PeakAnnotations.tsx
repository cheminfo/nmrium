import { useMemo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import useSpectrum from '../hooks/useSpectrum';

import PeakAnnotation from './PeakAnnotation';
import getVerticalShift from './utilities/getVerticalShift';

const emptyData = { peaks: {}, info: {}, display: {} };

function PeakAnnotations() {
  const { activeSpectrum, verticalAlign, displayerKey } = useChartData();
  const { scaleX, scaleY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Datum1D;

  const Peaks = useMemo(() => {
    const getVerticalAlign = () => {
      return getVerticalShift(verticalAlign, { index: activeSpectrum?.index });
    };
    if (
      !spectrum?.peaks?.values ||
      !spectrum.display.isVisible ||
      !spectrum.display.isPeaksMarkersVisible
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
  }, [spectrum, verticalAlign, activeSpectrum?.index, scaleX, scaleY]);

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {Peaks}
    </g>
  );
}

export default PeakAnnotations;
