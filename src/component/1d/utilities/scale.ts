import { scaleLinear, zoomIdentity } from 'd3';

function getXScale(state, spectrumId: number | null | string = null) {
  const { width, margin, xDomains, xDomain, mode } = state;
  const range =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];
  return scaleLinear(spectrumId ? xDomains[spectrumId] : xDomain, range);
}

function getYScale(state, spectrumId: number | null | string = null) {
  const { height, margin, verticalAlign, yDomain, yDomains } = state;
  const _height =
    verticalAlign.align === 'center'
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

function getIntegralYScale(state) {
  const { height, margin, verticalAlign, integralsYDomains, activeSpectrum } =
    state;
  const _height = verticalAlign.align === 'center' ? height / 2 : height;
  return scaleLinear(
    activeSpectrum?.id &&
      integralsYDomains &&
      integralsYDomains[activeSpectrum?.id]
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

export { getXScale, getYScale, getIntegralYScale, reScaleY };
