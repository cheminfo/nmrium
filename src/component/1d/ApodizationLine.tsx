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

function useWindowYScale() {
  const { height, margin, verticalAlign } = useChartData();
  return getYScale({
    height,
    margin,
    verticalAlign,
    yDomain: [0, 1],
  });
}

function ApdoizationLine() {
  const {
    activeSpectrum,
    toolOptions: {
      selectedTool,
      data: { apodizationOptions },
    },
  } = useChartData();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum({ emptyData }) as Datum1D;
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const scaleY = useWindowYScale();

  if (!activeSpectrum?.id || selectedTool !== Filters.apodization.id) {
    return null;
  }

  const paths = () => {
    const pathBuilder = new PathBuilder();
    const { windowData: y } = apodizationFilter(
      spectrum,
      apodizationOptions || defaultApodizationOptions,
    );
    const x = spectrum.data?.x;

    if (x && y) {
      const pathPoints = xyReduce({ x, y });

      pathBuilder.moveTo(scaleX()(pathPoints.x[0]), scaleY(pathPoints.y[0]));
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(scaleX()(pathPoints.x[i]), scaleY(pathPoints.y[i]));
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
