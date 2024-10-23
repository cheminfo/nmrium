import type { Spectrum1D } from 'nmr-load-save';
import { apodization, Filters } from 'nmr-processing';

import { defaultApodizationOptions } from '../../data/constants/DefaultApodizationOptions.js';
import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce.js';
import { PathBuilder } from '../utility/PathBuilder.js';

import { getYScale } from './utilities/scale.js';

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
          shapes: {
            lorentzToGauss: {
              start: 0,
              shape: {
                kind: 'lorentzToGauss',
                options: {
                  length,
                  dw,
                  lineBroadening:
                    gaussBroadening > 0 ? lineBroadening : -lineBroadening,
                  gaussBroadening,
                  lineBroadeningCenter,
                },
              },
            },
          },
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
