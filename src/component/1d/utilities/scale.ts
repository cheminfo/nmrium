import { scaleLinear, zoomIdentity } from 'd3';
import {
  ActiveSpectrum,
  Domains,
  Margin,
  SpectraDirection,
  VerticalAlignment,
} from '../../reducer/Reducer';
import { useChartData } from '../../context/ChartContext';
import { useCallback } from 'react';
import { useVerticalAlign } from '../../hooks/useVerticalAlign';

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
  margin: Margin;
  yDomains: Domains;
  yDomain: number[];
  verticalAlign: VerticalAlignment;
}

function getYScale(
  options: ScaleYOptions,
  spectrumId: number | null | string = null,
) {
  const { height, margin, verticalAlign, yDomain, yDomains } = options;
  const _height =
    verticalAlign === 'center'
      ? (height - 40) / 2
      : height - margin.bottom - 40;
  let domainY: [number, number] | [] = [];
  if (spectrumId === null || yDomains[spectrumId] === undefined) {
    domainY = [0, yDomain[1]];
  } else {
    domainY = [0, yDomains[spectrumId][1]];
  }
  return scaleLinear(domainY, [_height, margin.top]);
}

interface IntegralYScaleOptions {
  height: number;
  margin: Margin;
  integralsYDomains: Domains;
  activeSpectrum: ActiveSpectrum;
  verticalAlign: VerticalAlignment;
}

function getIntegralYScale(options: IntegralYScaleOptions) {
  const { height, margin, verticalAlign, integralsYDomains, activeSpectrum } =
    options;
  const _height = verticalAlign === 'center' ? height / 2 : height;
  return scaleLinear(
    activeSpectrum?.id && integralsYDomains?.[activeSpectrum?.id]
      ? integralsYDomains[activeSpectrum?.id]
      : [0, 0],
    [_height * 0.3, margin.top + _height * 0.1],
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
