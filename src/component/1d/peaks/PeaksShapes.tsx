import { peakToXY } from 'nmr-processing';

import { Datum1D, Peak } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import useSpectrum from '../../hooks/useSpectrum';
import { PathBuilder } from '../../utility/PathBuilder';
import getVerticalShift from '../utilities/getVerticalShift';

const emptyData = { peaks: {}, display: {} };

function PeaksShapes() {
  const {
    activeSpectrum,
    verticalAlign,
    displayerKey,
    toolOptions: {
      data: { showPeaksShapes },
    },
  } = useChartData();
  const { scaleX, scaleY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Datum1D;

  if (
    !spectrum?.peaks?.values ||
    !spectrum.display.isVisible ||
    !showPeaksShapes
  ) {
    return null;
  }

  const vAlign = getVerticalShift(verticalAlign, {
    index: activeSpectrum?.index,
  });

  const getPath = (peak: Peak) => {
    const data = peakToXY(peak);
    const _scaleX = scaleX();
    const _scaleY = scaleY(spectrum.id);

    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(_scaleX(data.x[0]), _scaleY(data.y[0]));
    for (let i = 1; i < data.x.length; i++) {
      pathBuilder.lineTo(_scaleX(data.x[i]), _scaleY(data.y[i]));
    }
    pathBuilder.closePath();

    return pathBuilder.toString();
  };

  return (
    <g className="peaks-shape" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {spectrum.peaks.values.map((peak) => {
        return (
          <path
            data-test-id="peak-shape"
            key={peak.id}
            stroke={'red'}
            fill={'red'}
            fillOpacity={0.3}
            d={getPath(peak)}
            transform={`translate(0,-${vAlign})`}
          />
        );
      })}
    </g>
  );
}

export default PeaksShapes;
