import type { Range, Signal1D } from '@zakodium/nmr-types';

export function unlink(range: Range, signalIndex: number): void {
  if (signalIndex !== -1) {
    const signal = range.signals[signalIndex];
    delete signal.diaIDs;
    delete signal.nbAtoms;
  } else {
    for (const signal of range.signals) {
      delete signal.diaIDs;
      delete signal.nbAtoms;
    }
  }
}

export function getOpacityBasedOnSignalKind(input: Range | Signal1D) {
  const isSignal =
    'signals' in input ? isSignalRange(input) : isSignalKind(input);
  return isSignal ? 1 : 0.3;
}

function isSignalKind(signal: Signal1D) {
  return signal.kind === 'signal';
}

export function isSignalRange(range: Range) {
  return range.signals.every(isSignalKind);
}
