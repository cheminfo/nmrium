import { Spectrum1D } from 'nmr-load-save';

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
    shiftValue =
      newSignalValue -
      spectrum.ranges.values[rangeIndex].signals[signalIndex].delta;
    spectrum.ranges.values[rangeIndex].signals[signalIndex].delta =
      newSignalValue;
  }
  return shiftValue;
}
