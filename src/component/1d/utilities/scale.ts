import { scaleLinear, zoomIdentity } from 'd3';
import { useCallback } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useSpectraBottomMargin } from '../../hooks/useSpectraBottomMargin.js';
import { useVerticalAlign } from '../../hooks/useVerticalAlign.js';
import type {
  Domains,
  Margin,
  SpectraDirection,
  VerticalAlignment,
} from '../../reducer/Reducer.js';
import { useIsInset } from '../inset/InsetProvider.js';

interface ScaleInsetXOptions {
  width: number;
  margin: Margin;
  xDomain: number[];
  mode: SpectraDirection;
}
interface ScaleXOptions extends ScaleInsetXOptions {
  xDomains: Domains;
}

interface InsetYScaleOptions {
  height: number;
  margin: Pick<Margin, 'top' | 'bottom'>;
  yDomain: number[];
  spectraBottomMargin: number;
}

interface ScaleYOptions extends InsetYScaleOptions {
  yDomains: Domains;
  verticalAlign: VerticalAlignment;
}

function getInsetXScale(options: ScaleInsetXOptions) {
  const { width, margin, xDomain, mode } = options;
  const range =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];
  return scaleLinear(xDomain, range);
}

function getInsetYScale(options: InsetYScaleOptions) {
  const { height, margin, yDomain, spectraBottomMargin = 10 } = options;
  const innerHeight = height - margin.bottom - spectraBottomMargin;
  return scaleLinear(yDomain, [innerHeight, margin.top]);
}

function getXScale(
  options: ScaleXOptions,
  spectrumId: number | null | string = null,
) {
  const { width, margin, xDomains, xDomain, mode } = options;
  const range =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];
  return scaleLinear(spectrumId ? xDomains[spectrumId] : xDomain, range);
}

function getYScale(
  options: ScaleYOptions,
  spectrumId: number | null | string = null,
) {
  const {
    height,
    margin,
    verticalAlign,
    yDomain,
    yDomains,
    spectraBottomMargin = 10,
  } = options;
  let domainY: number[] = yDomain;
  if (spectrumId && yDomains?.[spectrumId]) {
    domainY = yDomains[spectrumId];
  }
  const [min, max] = domainY;
  let bottomShift = spectraBottomMargin;

  if (verticalAlign === 'center') {
    bottomShift = 0;
    const maxim = Math.max(Math.abs(max), Math.abs(min));
    domainY = [-maxim, maxim];
  } else {
    domainY = [0, domainY[1]];
  }

  const innerHeight = height - margin.bottom - bottomShift;

  return scaleLinear(domainY, [innerHeight, margin.top]);
}

interface IntegralYScaleOptions {
  height: number;
  margin: Margin;
  yDomain: number[];
  scaleRatio: number;
  spectraBottomMargin: number;
}

function getIntegralYScale(options: IntegralYScaleOptions) {
  const { height, margin, yDomain, scaleRatio } = options;
  const [min, max] = yDomain;
  return scaleLinear(
    [min * scaleRatio, max * scaleRatio],
    [height * 0.3, margin.top + height * 0.1],
  );
}
function getYScaleWithRation(options: IntegralYScaleOptions) {
  const { height, margin, yDomain, scaleRatio, spectraBottomMargin } = options;
  const [min, max] = yDomain;
  return scaleLinear(
    [min * scaleRatio, max * scaleRatio],
    [height - margin.bottom - spectraBottomMargin, margin.top],
  );
}

function reScaleY(scale: number, { domain, height, margin }) {
  const _scale = scaleLinear(domain, [height - margin.bottom, margin.top]);

  const t = zoomIdentity
    .translate(0, _scale(0))
    .scale(scale)
    .translate(0, -_scale(0));

  return t.rescaleY(_scale).domain();
}

function useScaleX() {
  const { margin, mode, width, xDomain, xDomains } = useChartData();
  const isInset = useIsInset();

  return useCallback(
    (spectrumId = null) => {
      if (isInset) {
        return getInsetXScale({ margin, mode, width, xDomain });
      }

      return getXScale({ margin, mode, width, xDomain, xDomains }, spectrumId);
    },
    [isInset, margin, mode, width, xDomain, xDomains],
  );
}
function useScaleY() {
  const { margin, height, yDomain, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();
  const isInset = useIsInset();
  const spectraBottomMargin = useSpectraBottomMargin();

  return useCallback(
    (spectrumId = null) => {
      if (isInset) {
        return getInsetYScale({ margin, height, yDomain, spectraBottomMargin });
      }

      return getYScale(
        {
          margin,
          height,
          verticalAlign,
          yDomain,
          yDomains,
          spectraBottomMargin,
        },
        spectrumId,
      );
    },
    [
      isInset,
      margin,
      height,
      verticalAlign,
      yDomain,
      yDomains,
      spectraBottomMargin,
    ],
  );
}

export {
  useScaleX,
  useScaleY,
  getXScale,
  getYScale,
  getIntegralYScale,
  reScaleY,
  getYScaleWithRation,
  getInsetXScale,
  getInsetYScale,
};
