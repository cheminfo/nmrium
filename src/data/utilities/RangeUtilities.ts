import type { Range, Signal1D } from '@zakodium/nmr-types';

function omitSignalKeys(signal: Signal1D): Signal1D {
  const { diaIDs, nbAtoms, ...rest } = signal;
  return rest;
}

export function unlink(range: Range, signalIndex?: number): Range {
  return {
    ...range,
    signals: range.signals.map((signal, index) =>
      signalIndex === undefined || index === signalIndex
        ? omitSignalKeys(signal)
        : signal,
    ),
  };
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
