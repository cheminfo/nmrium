import merge from 'lodash/merge.js';
import type { Spectrum1D } from 'nmr-load-save';
import {
  Filters1D,
  createApodizationWindowData,
  default1DApodization,
} from 'nmr-processing';

import { useChartData } from '../context/ChartContext.js';
import { useFilterSyncOptions } from '../context/FilterSyncOptionsContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce.js';
import type { ApodizationOptions } from '../panels/filtersPanel/Filters/hooks/useApodization.js';
import { PathBuilder } from '../utility/PathBuilder.js';

import { useIsInset } from './inset/InsetProvider.js';
import { getYScale } from './utilities/scale.js';

const emptyData = { data: {}, info: {} };

function useWindowYScale() {
  const { spectraBottomMargin } = useScaleChecked();
  const { height, margin, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();
  return getYScale({
    height,
    margin,
    verticalAlign,
    yDomain: [0, 1],
    yDomains,
    spectraBottomMargin,
  });
}

export function ApodizationLine() {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const isInset = useIsInset();

  const activeSpectrum = useActiveSpectrum();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum({ emptyData }) as Spectrum1D;
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const scaleY = useWindowYScale();
  const { sharedFilterOptions: externalApodizationOptions } =
    useFilterSyncOptions<ApodizationOptions>();

  if (
    !activeSpectrum?.id ||
    selectedTool !== Filters1D.apodization.name ||
    isInset
  ) {
    return null;
  }

  const paths = () => {
    const pathBuilder = new PathBuilder();
    const { re, x } = spectrum.data;

    const apodizationOptions = merge(
      default1DApodization,
      externalApodizationOptions?.options,
    );
    const length = re.length;
    const dw = (x[length - 1] - x[0]) / (length - 1);

    const y = createApodizationWindowData({
      windowOptions: { dw, length },
      shapes: apodizationOptions,
    });

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
