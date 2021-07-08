import { extent, scaleLinear } from 'd3';

function getTopXScale(
  width: number,
  margin: { right: number; left: number },
  x: Array<number>,
) {
  const xDomain = extent(x);
  const scaleX = scaleLinear(extent(x) as any, [
    width - margin.right,
    margin.left,
  ]);

  return {
    xDomain,
    scaleX,
  };
}

function getLeftXScale(
  width: number,
  margin: { bottom: number; top: number },
  x: Array<number>,
) {
  const xDomain = extent(x);

  const scaleX = scaleLinear(extent(x) as any, [
    width - margin.bottom,
    margin.top,
  ]);

  return {
    xDomain,
    scaleX,
  };
}

function getYScale(height: number, y: Array<number>, margin = 10) {
  return scaleLinear(extent(y) as any, [height - margin, margin]);
}

export { getTopXScale, getLeftXScale, getYScale };
