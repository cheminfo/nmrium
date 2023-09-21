import { extent, scaleLinear } from 'd3';
import { xMaxValue } from 'ml-spectra-processing';

function getTopXScale(
  width: number,
  margin: { right: number; left: number },
  x: number[],
) {
  const xDomain = extent<number>(x);
  const scaleX = scaleLinear(extent(x) as number[], [
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
  x: number[],
) {
  const xDomain = extent(x);

  const scaleX = scaleLinear(extent(x) as number[], [
    width - margin.bottom,
    margin.top,
  ]);

  return {
    xDomain,
    scaleX,
  };
}

function getScale(size: number, data: Float64Array, margin = 10) {
  const max = xMaxValue(data);
  return scaleLinear([0, max] as number[], [size - margin, margin]);
}

export { getTopXScale, getLeftXScale, getScale };
