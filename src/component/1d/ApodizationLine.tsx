import { Spectrum1D } from 'nmr-load-save';
import { Filters, apodization } from 'nmr-processing';

import { defaultApodizationOptions } from '../../data/constants/DefaultApodizationOptions';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum';
import useSpectrum from '../hooks/useSpectrum';
import { useVerticalAlign } from '../hooks/useVerticalAlign';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';
import { PathBuilder } from '../utility/PathBuilder';

import { getYScale } from './utilities/scale';

const emptyData = { data: {}, info: {} };

function useWindowYScale() {
  const { height, margin, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();
  return getYScale({
    height,
    margin,
    verticalAlign,
    yDomain: [0, 1],
    yDomains,
  });
}

function ApodizationLine() {
  const {
    toolOptions: {
      selectedTool,
      data: { apodizationOptions },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum({ emptyData }) as Spectrum1D;
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const scaleY = useWindowYScale();

  if (!activeSpectrum?.id || selectedTool !== Filters.apodization.id) {
    return null;
  }

  const paths = () => {
    const pathBuilder = new PathBuilder();
    const { re, im = [], x } = spectrum.data;

    const { lineBroadening, gaussBroadening, lineBroadeningCenter } =
      apodizationOptions || defaultApodizationOptions;

    const length = re.length;
    const dw = (x[length - 1] - x[0]) / (length - 1);
    const { windowData: y } = apodization(
      { re, im },
      {
        apply: false,
        compose: {
          length,
          shapes: [
            {
              start: 0,
              shape: {
                kind: 'lorentzToGauss',
                options: {
                  length,
                  dw,
                  exponentialHz:
                    gaussBroadening > 0 ? lineBroadening : -lineBroadening,
                  gaussianHz: gaussBroadening,
                  center: lineBroadeningCenter,
                },
              },
            },
          ],
        },
      },
    );

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
      data-testid="apodization-line"
      stroke="green"
      fill="none"
      strokeWidth="2"
      d={paths()}
    />
  );
}

export default ApodizationLine;
