import { scaleLinear } from 'd3';

function getXScale(state, spectrumId = null) {
  const { width, margin, xDomains, xDomain, mode } = state;
  const range =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];
  return scaleLinear(spectrumId ? xDomains[spectrumId] : xDomain, range);
}

function getYScale(state, spectrumId = null) {
  const { height, margin, verticalAlign, yDomain, yDomains } = state;
  // if (height && margin && verticalAlign && yDomain && yDomains) {
  const _height =
    verticalAlign.flag && !verticalAlign.stacked ? height / 2 : height;

  let domainY = [];
  if (spectrumId === null || yDomains[spectrumId] === undefined) {
    domainY = [0, yDomain[1]];
  } else {
    domainY = [0, yDomains[spectrumId][1]];
  }
  return scaleLinear(domainY, [_height - margin.bottom, margin.top]);
  // } else {
  //   return null;
  // }
}

export { getXScale, getYScale };
