import { Datum1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import { useActiveSpectrum } from '../../reducer/Reducer';
import getVerticalShift from '../utilities/getVerticalShift';

import { usePeakShapesPath } from './usePeakShapesPath';

const emptyData = { peaks: {}, display: {} };

function PeaksShapes() {
  const {
    verticalAlign,
    displayerKey,
    toolOptions: {
      data: {
        peaksOptions: { showPeaksShapes, showPeaksSum },
      },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const spectrum = useSpectrum(emptyData) as Datum1D;

  if (!spectrum?.peaks?.values || !spectrum.display.isVisible) {
    return null;
  }

  const vAlign = getVerticalShift(verticalAlign, {
    index: activeSpectrum?.index,
  });

  return (
    <g className="peaks-shapes" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {showPeaksShapes && <PeaksShapesItems vAlign={vAlign} />}
      {showPeaksSum && <PeaksShapesSum vAlign={vAlign} />}
    </g>
  );
}

function PeaksShapesItems(props: { vAlign: number }) {
  const spectrum = useSpectrum(emptyData) as Datum1D;
  const getPath = usePeakShapesPath(spectrum);

  return (
    <g>
      {' '}
      {spectrum.peaks.values.map((peak) => {
        const { fill, path } = getPath({ target: 'peakShape', peak });
        return (
          <path
            key={peak.id}
            fill={fill}
            fillOpacity={0.3}
            d={path}
            transform={`translate(0,-${props.vAlign})`}
          />
        );
      })}
    </g>
  );
}

function PeaksShapesSum(props: { vAlign: number }) {
  const spectrum = useSpectrum(emptyData) as Datum1D;
  const getPath = usePeakShapesPath(spectrum);

  const { fill, path } = getPath({
    target: 'peaksSum',
    peaks: spectrum.peaks.values,
  });

  return (
    <path
      stroke={'darkblue'}
      fill={fill}
      d={path}
      transform={`translate(0,-${props.vAlign})`}
    />
  );
}

export default PeaksShapes;
