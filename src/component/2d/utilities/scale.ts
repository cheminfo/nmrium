import type { NmrData2D } from 'cheminfo-types';
import { scaleLinear } from 'd3-scale';
import { useMemo } from 'react';
import { assert } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext.js';
import type { Margin, SpectraDirection } from '../../reducer/Reducer.js';

interface Scale2DXOptions {
  width: number;
  margin: Pick<Margin, 'left' | 'right'>;
  xDomain: number[];
  mode: SpectraDirection;
}

function get2DXScale(options: Scale2DXOptions, reverse?: boolean) {
  const { width, margin, xDomain, mode } = options;
  const isReversed = reverse !== undefined ? reverse : mode === 'RTL';
  const range = isReversed
    ? [width - margin.right, margin.left]
    : [margin.left, width - margin.right];
  return scaleLinear(xDomain, range);
}

function useScale2DX(reverse?: boolean) {
  const { width, margin, xDomain, mode } = useChartData();
  return useMemo(
    () => get2DXScale({ width, margin, xDomain, mode }, reverse),
    [margin, mode, reverse, width, xDomain],
  );
}

interface Scale2DYOptions {
  height: number;
  margin: Pick<Margin, 'top' | 'bottom'>;
  yDomain: number[];
}

function get2DYScale(options: Scale2DYOptions, reverse = false) {
  const { height, margin, yDomain } = options;
  return scaleLinear(
    yDomain,
    reverse
      ? [height - margin.bottom, margin.top]
      : [margin.top, height - margin.bottom],
  );
}

function useScale2DY(reverse?: boolean) {
  const { height, margin, yDomain } = useChartData();
  return useMemo(
    () => get2DYScale({ height, margin, yDomain }, reverse),
    [height, margin, reverse, yDomain],
  );
}

function get1DYScale(yDomain: number[], height: number, margin = 10) {
  return scaleLinear(yDomain, [height - margin, margin]);
}

function use1DTraceYScale(
  SpectrumId: string,
  height: number,
  leftMargin: number,
) {
  const { yDomains } = useChartData();
  return get1DYScale(yDomains[SpectrumId], height, leftMargin);
}

interface SliceYScaleOptions {
  margin?: number;
  scaleRatio?: number;
}

function getMax(data: NmrData2D): number {
  let max;

  for (const { minZ, maxZ } of Object.values(data)) {
    const innerMax = Math.max(Math.abs(minZ), Math.max(maxZ));
    if (max === undefined || max > innerMax) {
      max = innerMax;
    }
  }

  // This must be true because 2D data has at least one mandatory property.
  assert(typeof max === 'number');

  return max;
}

function getSliceYScale(
  data: NmrData2D,
  size: number,
  mode: SpectraDirection,
  options: SliceYScaleOptions = {},
) {
  const { margin = 10, scaleRatio = 1 } = options;
  const max = getMax(data);
  size = mode === 'RTL' ? size : size / 2;
  return scaleLinear([0, max * scaleRatio] as number[], [
    size - margin,
    margin,
  ]);
}

export {
  get1DYScale,
  get2DXScale,
  get2DYScale,
  getSliceYScale,
  use1DTraceYScale,
  useScale2DX,
  useScale2DY,
};
