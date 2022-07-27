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

import { getYScale } from './utilities/scale';

const emptyData = { data: {}, info: {} };

function ApdoizationLine() {
  const {
    activeSpectrum,
    height,
    margin,
    verticalAlign,
    toolOptions: {
      selectedTool,
      data: { apodizationOptions },
    },
  } = useChartData();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum({ emptyData }) as Datum1D;
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);

  if (!activeSpectrum?.id || selectedTool !== Filters.apodization.id) {
    return null;
  }

  const _scaleX = scaleX();
  const _scaleY = getYScale({
    height,
    margin,
    verticalAlign,
    yDomain: [0, 1],
  });

  const paths = () => {
    const pathBuilder = new PathBuilder();
    const { windowData: y } = apodizationFilter(
      spectrum,
      apodizationOptions || defaultApodizationOptions,
    );
    if (spectrum.data?.x && y && _scaleX(0)) {
      const x = spectrum.data?.x;

      const pathPoints = xyReduce({ x, y });

      pathBuilder.moveTo(_scaleX(pathPoints.x[0]), _scaleY(pathPoints.y[0]));
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(_scaleX(pathPoints.x[i]), _scaleY(pathPoints.y[i]));
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  };

  return (
    <path
      data-test-id="apodization-line"
      stroke="green"
      fill="none"
      strokeWidth="2"
      d={paths()}
    />
  );
}

export default ApdoizationLine;
