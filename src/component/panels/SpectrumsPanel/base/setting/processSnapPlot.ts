import { xyReduce } from 'ml-spectra-processing';

import { Data1D } from '../../../../../data/types/data1d';
import { MinMaxContent } from '../../../../../data/types/data2d/Data2D';
import { calculateSanPlot } from '../../../../../data/utilities/calculateSanPlot';

export function processSnapPlot<T extends '1D' | '2D'>(
  dimension: T,
  data: T extends '1D' ? Data1D : MinMaxContent,
  yLogBase: number,
) {
  const sanResult = calculateSanPlot(dimension, data);
  const sanPlot: any = {};
  const lines: any = {};
  for (let plotKey in sanResult.sanplot) {
    const { x, y } = xyReduce(sanResult.sanplot[plotKey]);
    let result = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = { x: x[i], y: y[i] };
    }
    sanPlot[plotKey] = result;
    lines[plotKey] = getLine(sanResult[plotKey], result, { yLogBase });
  }
  return { sanPlot, lines };
}

function getLine(value, data, options) {
  const { log10, abs } = Math;
  const { yLogBase } = options;
  const first = data.length > 0 ? data[0].x : 0;
  const last = data.length > 0 ? data[data.length - 1].x : 0;
  const inLogScale = log10(abs(value)) / log10(yLogBase);
  return [
    { x: first, y: inLogScale },
    { x: last, y: inLogScale },
  ];
}
