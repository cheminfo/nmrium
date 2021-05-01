export function flat2DSignals(signals) {
  let flattedSignal = [];
  for (let i = 0; i < signals.length; i++) {
    let { x, y } = signals[i];
    flattedSignal.push(x, y);
  }
  return flattedSignal;
}
