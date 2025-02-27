import type { NmrData2D } from 'cheminfo-types';
import { scaleLinear } from 'd3';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import type { Margin, SpectraDirection } from '../../reducer/Reducer.js';

import type { Layout } from './DimensionLayout.js';
import { LAYOUT } from './DimensionLayout.js';

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

interface TopLayout {
  width: number;
  margin: { right: number; left: number };
  xDomain: number[];
}

interface LeftLayout {
  height: number;
  margin: { bottom: number; top: number };
  yDomain: number[];
}

function get1DXScale(props: TopLayout | LeftLayout, layout: Layout) {
  if (!['TOP_1D', 'LEFT_1D'].includes(layout)) {
    throw new Error(
      `layout is required and must be ${LAYOUT.TOP_1D} or ${LAYOUT.LEFT_1D}  `,
    );
  }

  switch (layout) {
    case LAYOUT.TOP_1D: {
      const { width, margin, xDomain } = props as TopLayout;
      return scaleLinear(xDomain, [width - margin.right, margin.left]);
    }
    case LAYOUT.LEFT_1D: {
      const { height, margin, yDomain } = props as LeftLayout;
      return scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    }
    default:
      break;
  }
}

function get1DYScale(yDomain: number[], height: number, margin = 10) {
  return scaleLinear(yDomain, [height - margin, margin]);
}

function use1DTraceYScale(
  SpectrumId: string,
  height: number,
  verticalMargin: number,
) {
  const { yDomains } = useChartData();
  return get1DYScale(yDomains[SpectrumId], height, verticalMargin);
}

interface SliceYScaleOptions {
  margin?: number;
  scaleRatio?: number;
}

function getMax(data: NmrData2D) {
  let max;

  for (const key in data) {
    const { minZ, maxZ } = data[key];
    const innerMax = Math.max(Math.abs(minZ), Math.max(maxZ));
    if (max === undefined || max > innerMax) {
      max = innerMax;
    }
  }
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
  get2DXScale,
  getSliceYScale,
  get2DYScale,
  get1DXScale,
  get1DYScale,
  useScale2DX,
  useScale2DY,
  use1DTraceYScale,
};
