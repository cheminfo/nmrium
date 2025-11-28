import type { Spectrum1D } from '@zakodium/nmrium-core';
import merge from 'lodash/merge.js';
import { xyReduce } from 'ml-spectra-processing';
import {
  Filters1D,
  createApodizationWindowData,
  default1DApodization,
} from 'nmr-processing';

import { useChartData } from '../context/ChartContext.js';
import { useFilterSyncOptions } from '../context/FilterSyncOptionsContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { useIndicatorLineColor } from '../hooks/useIndicatorLineColor.js';
import useSpectrum from '../hooks/useSpectrum.js';
import useTempSpectrum from '../hooks/useTempSpectrum.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';
import type { ApodizationOptions } from '../panels/filtersPanel/Filters/hooks/useApodization.js';
import { PathBuilder } from '../utility/PathBuilder.js';

import { useIsInset } from './inset/InsetProvider.js';
import { getXScale, getYScale } from './utilities/scale.js';

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
function useWindowXScale() {
  const { width, margin } = useChartData();
  const spectrum = useTempSpectrum() as Spectrum1D;

  if (!spectrum) return;

  const {
    data: { x },
  } = spectrum;
  return getXScale({
    width,
    margin,
    xDomain: [x[0], x.at(-1) as number],
    xDomains: {},
    mode: 'LTR',
  });
}

export function ApodizationLine() {
  const {
    toolOptions: { selectedTool },
    width,
  } = useChartData();
  const isInset = useIsInset();

  const activeSpectrum = useActiveSpectrum();
  const tempSpectrum = useTempSpectrum() as Spectrum1D;
  const processedSpectrum = useSpectrum() as Spectrum1D;

  const scaleY = useWindowYScale();
  const windowScaleX = useWindowXScale();
  const { scaleX: baseScaleX } = useScaleChecked();
  const { sharedFilterOptions: externalApodizationOptions } =
    useFilterSyncOptions<ApodizationOptions>();
  const indicatorColor = useIndicatorLineColor();
  if (
    !processedSpectrum ||
    !activeSpectrum ||
    selectedTool !== Filters1D.apodization.name ||
    isInset
  ) {
    return null;
  }

  let scaleX = baseScaleX();

  if (processedSpectrum.info.isFt && windowScaleX) {
    scaleX = windowScaleX;
  }

  const pathBuilder = new PathBuilder();
  const { re, x } = tempSpectrum.data;

  const apodizationOptions = merge(
    default1DApodization,
    externalApodizationOptions?.options,
  );
  const length = re.length;
  const from = x.at(-1) as number;
  const to = x[0];
  const dw = (from - to) / (length - 1);

  const y = createApodizationWindowData({
    windowOptions: { dw, length },
    shapes: apodizationOptions,
  });

  if (x && y) {
    const pathPoints = xyReduce(
      { x, y },
      { from, to, nbPoints: width * 4, optimize: true },
    );

    pathBuilder.moveTo(scaleX(pathPoints.x[0]), scaleY(pathPoints.y[0]));
    for (let i = 1; i < pathPoints.x.length; i++) {
      pathBuilder.lineTo(scaleX(pathPoints.x[i]), scaleY(pathPoints.y[i]));
    }
  }

  return (
    <path
      data-testid="apodization-line"
      stroke={indicatorColor}
      fill="none"
      strokeWidth="2"
      d={pathBuilder.toString()}
    />
  );
}
