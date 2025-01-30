import { useChartData } from '../context/ChartContext.js';

function truncate(value, numberOfDigits = 0) {
  const power = 10 ** numberOfDigits;
  return Math.trunc(value * power) / power;
}

export function convertPixelToPercent(value: number, baseValue: number) {
  return truncate((value / baseValue) * 100, 3);
}
export function convertPercentToPixel(value: number, baseValue: number) {
  return Math.round((value / 100) * baseValue);
}

export function useSVGUnitConverter() {
  const { width, height } = useChartData();

  function pixelToPercent(value: number, axis: 'x' | 'y') {
    const size = axis === 'x' ? width : height;
    return convertPixelToPercent(value, size);
  }
  function percentToPixel(value: number, axis: 'x' | 'y') {
    const size = axis === 'x' ? width : height;
    return convertPercentToPixel(value, size);
  }

  return { pixelToPercent, percentToPixel };
}
