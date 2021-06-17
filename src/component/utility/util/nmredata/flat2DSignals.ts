export function flat2DSignals(signals) {
  let flattedSignal: Array<any> = [];
  for (const { x, y } of signals) {
    flattedSignal.push(x, y);
  }
  return flattedSignal;
}
