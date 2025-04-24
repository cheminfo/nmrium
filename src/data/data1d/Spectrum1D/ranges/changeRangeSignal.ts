import type { Spectrum1D } from 'nmrium-core';

interface RangeSignalOption {
  rangeID: string;
  signalID: string;
  newSignalValue: number;
}

export function changeRangeSignal(
  spectrum: Spectrum1D,
  options: RangeSignalOption,
) {
  const { rangeID, signalID, newSignalValue } = options;

  let shiftValue = 0;
  const rangeIndex = spectrum.ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
  if (rangeIndex !== -1) {
    const signalIndex = spectrum.ranges.values[rangeIndex].signals.findIndex(
      (signal) => signal.id === signalID,
    );
    const signal = spectrum.ranges.values[rangeIndex].signals[signalIndex];
    shiftValue = newSignalValue - signal.delta;
    signal.delta = newSignalValue;
  }
  return shiftValue;
}
