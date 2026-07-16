import type { Range, Signal1D } from '@zakodium/nmr-types';

function omitSignalKeys(signal: Signal1D): Signal1D {
  const { diaIDs, nbAtoms, ...rest } = signal;
  return rest;
}

export function unlink(range: Range, signalIndex?: number | 'all'): Range {
  //Remove legacy -1 support and use 'all' only
  const shouldUnlinkAll = [undefined, 'all', -1].includes(signalIndex);

  return {
    ...range,
    signals: range.signals.map((signal, index) =>
      shouldUnlinkAll || index === signalIndex
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
