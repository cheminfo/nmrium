import * as Filters from '../../data/Filters';
import {
  apodizationFilter,
  defaultApodizationOptions,
} from '../../data/data1d/filter1d/apodization';
import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import useSpectrum from '../hooks/useSpectrum';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';
import { PathBuilder } from '../utility/PathBuilder';

const emptyData = { data: {}, info: {} };

function ApdoizationLine() {
  const {
    activeSpectrum,
    toolOptions: {
      selectedTool,
      data: { apodizationOptions },
    },
  } = useChartData();
  const { scaleX, scaleY } = useScaleChecked();
  const spectrum = useSpectrum({ emptyData }) as Datum1D;
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);

  if (!activeSpectrum?.id || selectedTool !== Filters.apodization.id) { return null; }

  const _scaleX = scaleX();
  const _scaleY = scaleY(activeSpectrum?.id);

  const paths = () => {
    const pathBuilder = new PathBuilder();
    const { windowData: y } = apodizationFilter(
      spectrum,
      apodizationOptions || defaultApodizationOptions,
    );
    if (spectrum.data?.x && y && _scaleX(0)) {
      const x = spectrum.data?.x;

      const pathPoints = xyReduce({ x, y });

      pathBuilder.moveTo(
        _scaleX(pathPoints.x[0]),
        _scaleY(pathPoints.y[0] * 500000),
      );
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(
          _scaleX(pathPoints.x[i]),
          _scaleY(pathPoints.y[i] * 500000),
        );
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  };

  return (
    <path
      data-test-id="apodization-line"
      stroke='green'
      fill="none"
      d={paths()}
      transform="translate(0,-10)"
    />
  );
}

export default ApdoizationLine;
