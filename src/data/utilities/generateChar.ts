export default function generateChar(index: number): string {
  const aPotions = 'a'.charCodeAt(0);
  const zPostion = 'z'.charCodeAt(0);
  const len = zPostion - aPotions + 1;

  let chartResult = '';
  while (index >= 0) {
    chartResult = String.fromCharCode((index % len) + aPotions) + chartResult;
    index = Math.floor(index / len) - 1;
  }
  return chartResult;
}
