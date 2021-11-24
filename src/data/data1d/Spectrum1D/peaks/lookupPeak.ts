import max from 'ml-array-max';

// Lookup for apeak while the mouse move
/**
 *
 * @param {object<{x:Array<number>,re:Array<number>}>} data
 * @param  {object<{from:number,to:number}>} options
 */
export function lookupPeak(data, options) {
  const { from, to } = options;
  let minIndex = data.x.findIndex((number) => number >= from);
  let maxIndex = data.x.findIndex((number) => number >= to) - 1;

  if (minIndex > maxIndex) {
    minIndex = maxIndex;
    maxIndex = minIndex;
  }
  const dataRange = data.re.slice(minIndex, maxIndex);
  if (dataRange && dataRange.length > 0) {
    const yValue = max(dataRange);
    const xIndex = dataRange.findIndex((value) => value === yValue);
    const xValue = data.x[minIndex + xIndex];

    return { x: xValue, y: yValue, xIndex: minIndex + xIndex };
  }
  return null;
}
