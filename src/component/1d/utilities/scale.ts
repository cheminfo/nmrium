import { scaleLinear, zoomIdentity } from 'd3';
import { useCallback } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useVerticalAlign } from '../../hooks/useVerticalAlign';
import {
  Domains,
  Margin,
  SpectraDirection,
  VerticalAlignment,
} from '../../reducer/Reducer';

interface ScaleXOptions {
  width: number;
  margin: Margin;
  xDomains: Domains;
  xDomain: number[];
  mode: SpectraDirection;
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

interface ScaleYOptions {
  height: number;
  margin: Pick<Margin, 'top' | 'bottom'>;
  yDomains: Domains;
  yDomain: number[];
  verticalAlign: VerticalAlignment;
}

function getYScale(
  options: ScaleYOptions,
  spectrumId: number | null | string = null,
) {
  const { height, margin, verticalAlign, yDomain, yDomains } = options;
  let domainY: number[] = yDomain;
  if (spectrumId && yDomains?.[spectrumId]) {
    domainY = yDomains[spectrumId];
  }
  const [min, max] = domainY;
  let bottomShift = 40;

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
}

function getIntegralYScale(options: IntegralYScaleOptions) {
  const { height, margin, yDomain, scaleRatio } = options;
  const [min, max] = yDomain;
  return scaleLinear(
    [min * scaleRatio, max * scaleRatio],
    [height * 0.3, margin.top + height * 0.1],
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
  return useCallback(
    (spectrumId = null) =>
      getXScale({ margin, mode, width, xDomain, xDomains }, spectrumId),
    [margin, mode, width, xDomain, xDomains],
  );
}
function useScaleY() {
  const { margin, height, yDomain, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();

  return useCallback(
    (spectrumId = null) =>
      getYScale(
        { margin, height, verticalAlign, yDomain, yDomains },
        spectrumId,
      ),
    [margin, height, verticalAlign, yDomain, yDomains],
  );
}

export {
  useScaleX,
  useScaleY,
  getXScale,
  getYScale,
  getIntegralYScale,
  reScaleY,
};
