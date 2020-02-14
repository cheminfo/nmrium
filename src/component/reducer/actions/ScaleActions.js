import { scaleLinear } from 'd3';

function getScale({ xDomain, yDomain, width, height, margin, mode }) {
  const xRange =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];

  const x = scaleLinear(xDomain, xRange);
  const y = scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  return { x, y };
}

export { getScale };
